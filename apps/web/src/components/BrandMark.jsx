import Image from "next/image";

export default function BrandMark({ size = 60 }) {
  return (
    <Image
      src="/images/barangay-seal.png"
      alt="KatarunganHub barangay seal"
      width={size}
      height={size}
      className="brand-mark rounded-full"
      priority
    />
  );
}
