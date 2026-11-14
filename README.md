# ASTRA HEALTH

I am continuing an existing NASA competition project called ASTRA HEALTH, an AI-powered astronaut health monitoring and decision-support system.

I was previously working with another AI assistant, which already implemented the first two Login pages and completed several preparations for the remaining Login and Onboarding pages.

I want you to continue from the current progress, not start over.

I will provide:

The existing project files containing the code implemented so far.

A set of 6 generated images/assets that have already been prepared.

Any additional design references or images needed for the implementation.

Please inspect the provided files before making any changes.

1. Project Background

The website is designed for a NASA competition project focused on astronaut health monitoring.

The website includes:

Login and Sign Up.

User onboarding and personal health information collection.

Astronaut avatar selection.

A future health monitoring dashboard.

The overall visual identity is a futuristic space-themed interface with a deep-blue space background, stars, glowing effects, and a consistent NASA-inspired design.

2. What Has Already Been Completed

The previous implementation has already established the following:

A. First Two Pages

The first two Login pages have already been implemented.

Their design, background, colors, components, and styling are established.

These pages must remain unchanged.

B. Background

The new pages are intended to use exactly the same space background as the first two Login pages.

The background has already been implemented.

Reuse the existing background code and assets instead of creating a new one.

C. Colors

Colors were measured from the original PDF and reference designs.

The avatar selection red border has also been identified and prepared.

Maintain the existing color palette.

D. Avatars

Five astronaut characters have already been extracted from the original avatar reference image.

They have been prepared with clean edges.

Reuse these characters and do not generate replacements.

E. Helmet Images
Three helmet variations have already been created:

Clear visor.

Gold visor.

Tinted visor.

F. "Why We Ask" Illustrations

Three of the four required illustrations have already been generated:

Body silhouette.

Pulse oximeter.

Heart-rate zones chart.

I will provide the six prepared images/assets. Use them directly in the appropriate locations without regenerating or replacing them.

3. Remaining Illustration – Muscle & Bone

One illustration is still missing: the muscle-group map for the Muscle & Bone section.

The previous image generation attempt was blocked.

For this illustration, use one of the existing astronaut characters wearing their spacesuit, with glowing sensor points highlighting the relevant muscle groups.

The illustration should:

Match the visual style of the existing astronaut characters.

Clearly communicate the location of the muscle sensor points.

Use the same color palette and futuristic medical visual style.

Avoid realistic anatomical or nude human imagery.

Do not change the other three completed illustrations.

4. Remaining Pages to Implement

Continue implementing the remaining Login and Onboarding flow based on the PDF reference I will provide.

Important:

Analyze the PDF carefully.

Implement every required page except the last page of the PDF.

I will provide a separate external image to replace that last page.

Use the external image as the reference for the replacement page instead of implementing the PDF's last page.

The Onboarding flow should follow this exact sequence:

Sign Up.

Step 2 – Basic Information.

Vital Signs.

Heart & Recovery.

Muscle & Bone.

Choose Your Avatar.

Make sure the navigation between these steps works correctly.

5. Navigation and Functionality

Implement the following behavior:

The Sign Up button should navigate to Step 2 – Basic Information.

Each step should navigate to the next step correctly.

Back buttons should return to the previous step.

"Skip for now" should work on the onboarding steps as previously planned.

User answers and entered information must be preserved when navigating backward and forward between steps.

The progress bar must update correctly as the user moves through the onboarding flow.

All forms, inputs, selections, and interactive elements should function correctly.

On the final Choose Your Avatar page:

Display the "Launch Dashboard" button.

Display the "Skip for now" button.

Keep both buttons visible and properly styled.

For now, neither button should perform any action or navigation.

6. NASA Logo and Progress Bar

Add the NASA logo at the top-left corner of every new page.

Use the NASA logo asset from the provided files if available.

Maintain consistent size, positioning, and spacing.

The onboarding progress bar should appear in the same position across all onboarding steps.

Keep its appearance consistent with the established design.

7. Critical Design Requirements

Visual accuracy is my highest priority.

Use exactly the same background as the first two Login pages.

Maintain the same gradients, starfield, lighting, glow effects, and space atmosphere.

Follow the original PDF designs as closely as possible.

Preserve the existing typography, colors, spacing, borders, shadows, and component styles.

Use the six provided images in their intended locations.

Do not introduce new visual styles that conflict with the existing design.

Do not redesign or simplify any page.

The new pages should look as if they were originally designed together with the first two pages.

8. Development Requirements

Continue working on the existing codebase.

Do not create a new project.

Do not rewrite the first two completed pages.

Preserve the existing framework, dependencies, folder structure, and coding conventions.

Reuse existing components, CSS, assets, and functions whenever possible.

Avoid unnecessary dependencies and duplicated code.

Ensure the website is responsive while prioritizing the original desktop design.

Test all navigation and interactions.

9. Dashboard – Future Development

The Dashboard has NOT been implemented yet.

Do not build the Dashboard at this stage.

I will provide its design reference separately after the Login and Onboarding flow is completed.

For now, leave "Launch Dashboard" and the final "Skip for now" buttons without any action, as explained above.

10. How I Want You to Work

Before writing or modifying any code:

Inspect the existing project structure.

Review the completed Login pages and understand their implementation.

Review the provided PDF and external replacement image.

Inspect all six prepared images and identify where each belongs.

Check which components and assets are already available.

Do not regenerate completed assets or repeat work that has already been done.

If something essential is missing, ask me before making assumptions.

Final Objective:

Complete the remaining Login and Onboarding pages while preserving the existing implementation and achieving the highest possible visual accuracy.

I want a fully functional, consistent, professional website that follows the original designs as closely as possible.

Continue the existing work. Do not start from scratch.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bfdd25a9-ea5b-4f78-9ad5-0b00f5cb385c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
