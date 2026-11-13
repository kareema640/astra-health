import nasaLogo from "@/assets/nasa-logo.png.asset.json";

/** NASA mark, divider and product name shown above both auth cards. */
export function BrandHeader() {
  return (
    <header className="flex items-start">
      <img src={nasaLogo.url} alt="NASA" width={126} height={112} className="h-[112px] w-[126px]" />
      <span aria-hidden className="mt-[10px] ml-[36px] h-[98px] w-[2px] rounded-full bg-foreground/80" />
      <div className="mt-[17px] ml-[42px]">
        <p className="text-[32px] leading-[34px] font-medium tracking-[0.005em] text-foreground">
          Astra Health
          <br />
          Monitoring System
        </p>
        <p className="mt-[10px] flex items-center gap-[15px] text-[17.5px] leading-none text-foreground/95">
          <span>Monitor</span>
          <span aria-hidden className="size-[5px] rounded-full bg-foreground" />
          <span>Predict</span>
          <span aria-hidden className="size-[5px] rounded-full bg-foreground" />
          <span>Protect</span>
        </p>
      </div>
    </header>
  );
}
