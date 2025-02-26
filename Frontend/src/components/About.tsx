"use client";
import { motion } from "framer-motion";
import Image from "next/image"; // For optimized images in Next.js

export default function About() {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, staggerChildren: 0.2 }, // Staggered animation
    };
    const slideInLeft = {
        initial: { opacity: 0, x: -50 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.6 },
    };
    const slideInRight = {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.6 },
    };

    return (
        <section className="w-full py-20 bg-gradient-to-r from-gray-50 to-gray-100 overflow-hidden">
            {/* Background Shape */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, type: "spring", stiffness: 100, damping: 10 }}
                className="absolute inset-0 w-full h-full bg-cover bg-center opacity-20 z-0"
                style={{ backgroundImage: "url('/path/to/your/background-pattern.svg')" }} // Replace with your image path or remove entirely
            ></motion.div>

            {/* Main Content */}
            <div className="container mx-auto px-4 relative z-10">
                {/* Hero Section */}
                <motion.div variants={fadeIn} className="text-center mb-16">
                    <h2 className="text-5xl font-extrabold text-gray-900 mb-4 font-pj">About Our AI-Powered Writing Assistant</h2>
                    <p className="text-xl text-gray-700 max-w-3xl mx-auto font-inter">
                        Our app leverages advanced AI models like GPT-2 to help you write faster, smarter, and with greater creativity. Whether you're crafting stories, drafting emails, or brainstorming ideas, our tool adapts to your needs and provides intelligent suggestions in real-time.
                    </p>
                </motion.div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1: AI-Powered Suggestions */}
                    <motion.div variants={slideInLeft} className="bg-white rounded-lg shadow-lg p-8 text-center md:text-left">
                        <div className="flex justify-center md:block mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-indigo-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.032 7.468h13.936a1.125 1.125 0 0 1 1.121 1.243Z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2 font-pj">AI-Powered Suggestions</h3>
                        <p className="text-gray-700 font-inter">
                            Our app analyzes your input in real-time and provides context-aware suggestions, helping you overcome writer's block and refine your ideas effortlessly.
                        </p>
                    </motion.div>

                    {/* Feature 2: Contextual Understanding */}
                    <motion.div variants={fadeIn} className="bg-white rounded-lg shadow-lg p-8 text-center md:text-left">
                        <div className="flex justify-center md:block mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-indigo-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2 font-pj">Contextual Understanding</h3>
                        <p className="text-gray-700 font-inter">
                            With billions of parameters, our AI understands the nuances of language, ensuring that every suggestion aligns perfectly with your writing style and intent.
                        </p>
                    </motion.div>

                    {/* Feature 3: Multi-Use Cases */}
                    <motion.div variants={slideInRight} className="bg-white rounded-lg shadow-lg p-8 text-center md:text-left">
                        <div className="flex justify-center md:block mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-indigo-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 0 6 18c1.052 0 2.062.18 3 .512V7.5a8.967 8.967 0 0 0-6-3.75z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2 font-pj">Multi-Use Cases</h3>
                        <p className="text-gray-700 font-inter">
                            From creative storytelling to professional emails, our app adapts to various use cases, making it a versatile tool for writers, students, and professionals alike.
                        </p>
                    </motion.div>
                </div>

                {/* How It Works Section */}
                <motion.div variants={fadeIn} className="mt-16 text-center">
                    <h3 className="text-4xl font-bold text-gray-900 mb-4 font-pj">How It Works</h3>
                    <p className="text-lg text-gray-700 max-w-3xl mx-auto font-inter mb-8">
                        Our app uses state-of-the-art machine learning algorithms to analyze your input and generate intelligent suggestions. Simply start typing, and the AI will assist you every step of the way—whether you're looking for the next word, sentence, or idea.
                    </p>
                    <Image
                        src="/path/to/your/how-it-works-diagram.png" // Replace with your diagram or illustration
                        alt="How It Works"
                        width={1200}
                        height={600}
                        className="rounded-lg shadow-lg mx-auto"
                        priority
                    />
                </motion.div>

                {/* Call to Action */}
                <motion.div variants={fadeIn} className="mt-16 text-center">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4 font-pj">Ready to Transform Your Writing?</h3>
                    <p className="text-lg text-gray-700 max-w-2xl mx-auto font-inter mb-8">
                        Join thousands of users who are already leveraging our AI-powered writing assistant to create compelling content with ease.
                    </p>
                    <button className="bg-blue-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-600 transition duration-300">
                        Get Started Now
                    </button>
                </motion.div>
            </div>
        </section>
    );
}