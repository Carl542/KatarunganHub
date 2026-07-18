import Image from "next/image";

export default function BrandMark({ size = 60 }) {
  return (
    <div
      className="brand-mark relative shrink-0 rounded-full overflow-hidden ring-1 ring-brass/30"
      style={{ width: size, height: size }}
    >
      <Image
        src="/images/barangay-seal.png"
        alt="KatarunganHub barangay seal"
        fill
        sizes={`${size}px`}
        quality={100}
        className="object-cover"
        priority
      />
    </div>
  );
}
