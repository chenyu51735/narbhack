import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto flex flex-col items-center justify-center px-4 text-center">
        <Image
          src="/images/logo.svg"
          width={120}
          height={48}
          alt="Voxxi logo"
          className="mb-6"
        />
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 mb-4 font-montserrat">
          Voxxi
        </h1>
        <div className="text-xl sm:text-2xl font-semibold text-blue-600 mb-4">
          Find your perfect voice gaming companion
        </div>
        <p className="max-w-2xl text-gray-600 text-lg sm:text-xl mb-8">
          Connect, play, and win together with real gamers. Voxxi makes it easy to find or become a trusted voice companion for your favorite games.
        </p>
        <Link href="/auth">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors">
            Get Started
          </button>
        </Link>
      </div>
    </section>
  );
};

export default Hero;
