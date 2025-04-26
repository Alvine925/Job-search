import { Star } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  text: string;
  imageUrl: string;
  stars: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Software Developer",
    company: "Google",
    text: "JobMatch made my job search so much easier. I was able to find relevant opportunities quickly and landed my dream job within 3 weeks of creating my profile. The application tracking feature was particularly helpful!",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
    stars: 5
  },
  {
    id: 2,
    name: "David Rodriguez",
    role: "HR Manager",
    company: "Tesla",
    text: "As a hiring manager, JobMatch has revolutionized our recruitment process. The platform helps us find qualified candidates quickly, and the messaging feature makes communication seamless. We've reduced our time-to-hire by 40%!",
    imageUrl: "https://images.unsplash.com/photo-1557862921-37829c790f19?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
    stars: 5
  }
];

export default function TestimonialSection() {
  return (
    <section className="py-16 bg-slate-100">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-secondary mb-12">Success Stories</h2>
        
        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="flex-1 bg-white p-8 rounded-lg shadow-sm relative">
              <div className="absolute -top-4 left-8 bg-amber-500 text-white p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.imageUrl} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full mr-4 object-cover" 
                />
                <div>
                  <h4 className="font-semibold text-secondary">{testimonial.name}</h4>
                  <p className="text-sm text-slate-500">{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
              <p className="text-slate-600 mb-4">{testimonial.text}</p>
              <div className="flex text-amber-400">
                {Array.from({ length: testimonial.stars }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
