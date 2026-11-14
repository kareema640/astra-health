import nasaLogo from "@/assets/nasa-logo.png.asset.json";

/** NASA mark, divider and product name shown above both auth cards. */
export function BrandHeader() {
  return (
    <header className="flex items-center gap-[16px] sm:gap-[28px]">
      <img
        src={nasaLogo.url}
        alt="NASA"
        width={126}
        height={112}
        className="h-[68px] w-[76px] shrink-0 sm:h-[96px] sm:w-[108px] lg:h-[112px] lg:w-[126px]"
      />
      <span
        aria-hidden
        className="h-[58px] w-[2px] shrink-0 rounded-full bg-foreground/80 sm:h-[82px] lg:h-[94px]"
      />
      <div className="min-w-0">
        <p className="text-[21px] leading-[25px] font-medium tracking-[0.005em] text-foreground sm:text-[28px] sm:leading-[32px] lg:text-[32px] lg:leading-[36px]">
          Astra Health
          <br />
          Monitoring System
        </p>
        <p className="mt-[6px] flex flex-wrap items-center gap-x-[10px] gap-y-[2px] text-[13.5px] leading-none text-foreground/95 sm:mt-[10px] sm:gap-x-[15px] sm:text-[17px]">
          <span>Monitor</span>
          <span aria-hidden className="size-[4px] rounded-full bg-foreground sm:size-[5px]" />
          <span>Predict</span>
          <span aria-hidden className="size-[4px] rounded-full bg-foreground sm:size-[5px]" />
          <span>Protect</span>
        </p>
      </div>
    </header>
  );
}
