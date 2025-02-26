import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HahaPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-8">
      <h1 className="text-4xl font-bold mb-4">Oops... No Module Found!</h1>
      <p className="text-lg max-w-md mb-6">
        "Why did the AI refuse to answer the call? Because it was too <span className='font-bold'>deep in thought</span>!" 🤖💭
      </p>
      <p className="text-muted-foreground max-w-lg mb-6">
        We truly appreciate your enthusiasm to discuss with us, but unfortunately, the module isn’t here yet.
        Why? Because Gnan was lazy—seriously, why would anyone even try to contact us? 😆
      </p>
      <Button variant="outline" asChild>
        <Link href="/">Go Back and Pretend This Never Happened</Link>
      </Button>
    </div>
  );
}
