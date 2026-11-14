import { Router } from "express";
import { query } from "../db";
import { h, s, strOrNull, validationFail } from "../lib/api";
import { requireAuth, resolveAstronaut } from "../middleware/auth";
import { syncSchema } from "../validators/health";

/**
 * Persists the answers collected by the existing Onboarding flow (and the
 * account fields from Sign Up) into the clinical profile tables. Idempotent
 * upsert keyed by the signed-in user's astronaut record — the frontend keeps
 * its local store exactly as is; this mirrors it server-side.
 */
export const onboardingRouter = Router();
onboardingRouter.use(requireAuth());

onboardingRouter.post(
  "/sync",
  h(async (req, res) => {
    const parsed = syncSchema.safeParse(req.body);
    if (!parsed.success) return validationFail(res, parsed.error);
    const aid = await resolveAstronaut(req.user);
    const d = parsed.data;

    if (d.account?.joinDate) {
      await query(
        "UPDATE astronauts SET join_date_display = $2, updated_at = now() WHERE id = $1",
        [aid, strOrNull(d.account.joinDate)],
      );
    }

    if (d.basic) {
      await query(
        `INSERT INTO astronaut_profiles
           (astronaut_id, age, sex, height, height_unit, weight, weight_unit)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (astronaut_id) DO UPDATE SET
           age = COALESCE(EXCLUDED.age, astronaut_profiles.age),
           sex = COALESCE(EXCLUDED.sex, astronaut_profiles.sex),
           height = COALESCE(EXCLUDED.height, astronaut_profiles.height),
           height_unit = COALESCE(EXCLUDED.height_unit, astronaut_profiles.height_unit),
           weight = COALESCE(EXCLUDED.weight, astronaut_profiles.weight),
           weight_unit = COALESCE(EXCLUDED.weight_unit, astronaut_profiles.weight_unit),
           updated_at = now()`,
        [aid, d.basic.age, d.basic.sex, d.basic.height, d.basic.heightUnit, d.basic.weight, d.basic.weightUnit],
      );
    }

    if (d.vitals) {
      await query(
        `INSERT INTO onboarding_vitals_baselines
           (astronaut_id, systolic_mmhg, diastolic_mmhg, bp_unknown,
            respiratory_rate, spo2_pct, measured_with_device)
         VALUES ($1,$2,$3,COALESCE($4,false),$5,$6,COALESCE($7,false))
         ON CONFLICT (astronaut_id) DO UPDATE SET
           systolic_mmhg = COALESCE(EXCLUDED.systolic_mmhg, onboarding_vitals_baselines.systolic_mmhg),
           diastolic_mmhg = COALESCE(EXCLUDED.diastolic_mmhg, onboarding_vitals_baselines.diastolic_mmhg),
           bp_unknown = EXCLUDED.bp_unknown,
           respiratory_rate = COALESCE(EXCLUDED.respiratory_rate, onboarding_vitals_baselines.respiratory_rate),
           spo2_pct = COALESCE(EXCLUDED.spo2_pct, onboarding_vitals_baselines.spo2_pct),
           measured_with_device = EXCLUDED.measured_with_device,
           updated_at = now()`,
        [
          aid, d.vitals.systolic, d.vitals.diastolic, d.vitals.bpUnknown ?? false,
          d.vitals.respiratoryRate, d.vitals.spo2, d.vitals.measuredWithDevice ?? false,
        ],
      );
    }

    if (d.heart) {
      await query(
        `INSERT INTO onboarding_heart_recovery
           (astronaut_id, alert_enabled, resting_hr, conditions, alert_above,
            alert_below, sleep_target, hydration)
         VALUES ($1,COALESCE($2,true),$3,$4,$5,$6,$7,$8)
         ON CONFLICT (astronaut_id) DO UPDATE SET
           alert_enabled = COALESCE(EXCLUDED.alert_enabled, onboarding_heart_recovery.alert_enabled),
           resting_hr = COALESCE(EXCLUDED.resting_hr, onboarding_heart_recovery.resting_hr),
           conditions = COALESCE(EXCLUDED.conditions, onboarding_heart_recovery.conditions),
           alert_above = COALESCE(EXCLUDED.alert_above, onboarding_heart_recovery.alert_above),
           alert_below = COALESCE(EXCLUDED.alert_below, onboarding_heart_recovery.alert_below),
           sleep_target = COALESCE(EXCLUDED.sleep_target, onboarding_heart_recovery.sleep_target),
           hydration = COALESCE(EXCLUDED.hydration, onboarding_heart_recovery.hydration),
           updated_at = now()`,
        [
          aid,
          d.heart.heartAlert === null || d.heart.heartAlert === undefined
            ? null
            : d.heart.heartAlert === "on",
          d.heart.restingHr,
          d.heart.conditions ?? [],
          d.heart.alertAbove,
          d.heart.alertBelow,
          d.heart.sleep,
          d.heart.hydration,
        ],
      );
      // The user's own thresholds become the live alert rule.
      await query(
        `INSERT INTO alert_rules (astronaut_id, hr_above, hr_below)
         VALUES ($1,$2,$3)
         ON CONFLICT (astronaut_id) DO UPDATE SET
           hr_above = COALESCE(EXCLUDED.hr_above, alert_rules.hr_above),
           hr_below = COALESCE(EXCLUDED.hr_below, alert_rules.hr_below),
           updated_at = now()`,
        [aid, d.heart.alertAbove, d.heart.alertBelow],
      );
    }

    if (d.muscle) {
      await query(
        `INSERT INTO onboarding_muscle_bone (astronaut_id, muscle_mass_kg, bone_density, emg_group)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (astronaut_id) DO UPDATE SET
           muscle_mass_kg = COALESCE(EXCLUDED.muscle_mass_kg, onboarding_muscle_bone.muscle_mass_kg),
           bone_density = COALESCE(EXCLUDED.bone_density, onboarding_muscle_bone.bone_density),
           emg_group = COALESCE(EXCLUDED.emg_group, onboarding_muscle_bone.emg_group),
           updated_at = now()`,
        [aid, d.muscle.muscleMass, d.muscle.boneDensity, d.muscle.emgGroup],
      );
      for (const [kind, filename] of [
        ["emg_report", d.muscle.emgFile],
        ["dexa_report", d.muscle.dexaFile],
      ] as const) {
        const name = strOrNull(filename);
        if (!name) continue;
        await query(
          `INSERT INTO uploaded_documents (astronaut_id, kind, filename)
           VALUES ($1,$2,$3)
           ON CONFLICT DO NOTHING`,
          [aid, kind, name],
        );
      }
    }

    if (d.avatar?.character) {
      await query(
        `INSERT INTO avatar_settings
           (astronaut_id, character_preset, skin, accent, suit, visor, callsign, from_photo)
         VALUES ($1,$2,COALESCE($3,'purple'),COALESCE($4,'red'),COALESCE($5,'eva-white'),
                 COALESCE($6,'clear'),$7,COALESCE($8,false))
         ON CONFLICT (astronaut_id) DO UPDATE SET
           character_preset = EXCLUDED.character_preset,
           skin = COALESCE(EXCLUDED.skin, avatar_settings.skin),
           accent = COALESCE(EXCLUDED.accent, avatar_settings.accent),
           suit = COALESCE(EXCLUDED.suit, avatar_settings.suit),
           visor = COALESCE(EXCLUDED.visor, avatar_settings.visor),
           callsign = COALESCE(EXCLUDED.callsign, avatar_settings.callsign),
           from_photo = COALESCE(EXCLUDED.from_photo, avatar_settings.from_photo),
           updated_at = now()`,
        [aid, d.avatar.character, d.avatar.skin, d.avatar.accent, d.avatar.suit,
         d.avatar.visor, d.avatar.callsign, d.avatar.fromPhoto],
      );
    }

    for (const [section, status] of Object.entries(d.progress ?? {})) {
      await query(
        `INSERT INTO onboarding_progress (astronaut_id, section, status)
         VALUES ($1,$2,$3)
         ON CONFLICT (astronaut_id, section) DO UPDATE SET
           status = EXCLUDED.status, recorded_at = now()`,
        [aid, section, status],
      );
    }

    // Audit trail records the action only — never health values (privacy rule).
    await query(
      `INSERT INTO audit_log (user_id, action, entity, entity_id, ip)
       VALUES ($1,'onboarding.sync','astronauts',$2,$3)`,
      [req.user.id, aid, req.ip ?? null],
    );
    return res.json({ ok: true });
  }),
);

/**
 * Snapshot in exactly the frontend's OnboardingData shape (strings, "" for
 * missing) so a signed-in user on a fresh device can restore their answers.
 */
onboardingRouter.get(
  "/snapshot",
  h(async (req, res) => {
    const aid = await resolveAstronaut(req.user);
    const [astro] = await query<Record<string, unknown>>(
      "SELECT join_date_display FROM astronauts WHERE id = $1",
      [aid],
    );
    const [basic] = await query<Record<string, unknown>>(
      "SELECT age, sex, height, height_unit, weight, weight_unit FROM astronaut_profiles WHERE astronaut_id = $1",
      [aid],
    );
    const [vitals] = await query<Record<string, unknown>>(
      "SELECT systolic_mmhg, diastolic_mmhg, bp_unknown, respiratory_rate, spo2_pct, measured_with_device FROM onboarding_vitals_baselines WHERE astronaut_id = $1",
      [aid],
    );
    const [heart] = await query<Record<string, unknown>>(
      "SELECT alert_enabled, resting_hr, conditions, alert_above, alert_below, sleep_target, hydration FROM onboarding_heart_recovery WHERE astronaut_id = $1",
      [aid],
    );
    const [muscle] = await query<Record<string, unknown>>(
      "SELECT muscle_mass_kg, bone_density, emg_group FROM onboarding_muscle_bone WHERE astronaut_id = $1",
      [aid],
    );
    const docs = await query<{ kind: string; filename: string }>(
      "SELECT kind, filename FROM uploaded_documents WHERE astronaut_id = $1 ORDER BY uploaded_at",
      [aid],
    );
    const [avatar] = await query<Record<string, unknown>>(
      "SELECT character_preset, skin, accent, suit, visor, callsign, from_photo, custom_photo_filename FROM avatar_settings WHERE astronaut_id = $1",
      [aid],
    );
    const progress = await query<{ section: string; status: string }>(
      "SELECT section, status FROM onboarding_progress WHERE astronaut_id = $1",
      [aid],
    );

    if (!basic && !vitals && !heart && !muscle && !avatar && progress.length === 0) {
      return res.json({ hasData: false, snapshot: null });
    }
    const findDoc = (kind: string) => docs.find((doc) => doc.kind === kind)?.filename ?? null;
    const snapshot = {
      account: {
        fullName: req.user.fullName,
        email: req.user.email,
        astronautId: req.user.astronautId,
        joinDate: s(astro?.join_date_display),
      },
      basic: {
        age: s(basic?.age),
        sex: (basic?.sex as string) ?? "male",
        height: s(basic?.height),
        heightUnit: (basic?.height_unit as string) ?? "cm",
        weight: s(basic?.weight),
        weightUnit: (basic?.weight_unit as string) ?? "kg",
      },
      vitals: {
        systolic: s(vitals?.systolic_mmhg),
        diastolic: s(vitals?.diastolic_mmhg),
        bpUnknown: Boolean(vitals?.bp_unknown),
        respiratoryRate: s(vitals?.respiratory_rate),
        spo2: s(vitals?.spo2_pct),
        measuredWithDevice: Boolean(vitals?.measured_with_device),
      },
      heart: {
        heartAlert: heart?.alert_enabled === false ? "off" : "on",
        restingHr: s(heart?.resting_hr),
        conditions: (heart?.conditions as string[]) ?? ["none"],
        alertAbove: s(heart?.alert_above),
        alertBelow: s(heart?.alert_below),
        sleep: (heart?.sleep_target as string) ?? "7-8",
        hydration: (heart?.hydration as string) ?? "2-3",
      },
      muscle: {
        muscleMass: s(muscle?.muscle_mass_kg),
        boneDensity: (muscle?.bone_density as string) ?? "unknown",
        emgFile: findDoc("emg_report"),
        dexaFile: findDoc("dexa_report"),
        emgGroup: (muscle?.emg_group as string) ?? "quadriceps",
      },
      avatar: {
        character: (avatar?.character_preset as string) ?? "explorer",
        skin: (avatar?.skin as string) ?? "purple",
        accent: (avatar?.accent as string) ?? "red",
        suit: (avatar?.suit as string) ?? "eva-white",
        visor: (avatar?.visor as string) ?? "clear",
        callsign: s(avatar?.callsign),
        fromPhoto: Boolean(avatar?.from_photo),
        customPhoto: "",
      },
      progress: Object.fromEntries(progress.map((p) => [p.section, p.status])),
    };
    return res.json({ hasData: true, snapshot });
  }),
);
