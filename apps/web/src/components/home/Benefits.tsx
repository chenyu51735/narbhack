import Image from "next/image";

const benefits = [
  {
    title: "Real-Time Voice Chat",
    description: "Communicate instantly with your gaming companions for better teamwork and fun.",
    image: "/images/bot.png",
  },
  {
    title: "Game-Specific Matching",
    description:
      "Find or become a companion for your favorite games. No more random teammates!",
    image: "/images/goodNews.png",
  },
  {
    title: "Trusted Community",
    description:
      "All companions are reviewed and rated by real gamers. Play with confidence.",
    image: "/images/profile.png",
  },
];

const Benefits = () => {
  return (
    <section id="Benefits" className="bg-blue-50 py-16">
      <div className="container mx-auto px-4">
        <h3 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-blue-900">Why Choose Voxxi?</h3>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex flex-col items-center bg-white rounded-xl p-8 max-w-xs w-full text-center"
            >
              <Image
                src={benefit.image}
                width={64}
                height={64}
                alt={benefit.title}
                className="mb-4"
              />
              <h4 className="text-xl font-semibold text-gray-900 mb-2 font-montserrat">
                {benefit.title}
              </h4>
              <p className="text-gray-600 text-base">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
