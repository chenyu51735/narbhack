import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
  isMobile?: boolean;
}

const Logo = ({ isMobile }: Props) => {
  return (
    <Link href="/">
      <div className="flex gap-2 items-center">
        <Image src="/images/logo.svg" width={32} height={16} alt="Voxxi logo" />
        {!isMobile ? (
          <h1 className="font-montserrat text-gray-900 text-2xl sm:text-3xl font-bold tracking-wide">
            Voxxi
          </h1>
        ) : null}
      </div>
    </Link>
  );
};

export default Logo;
