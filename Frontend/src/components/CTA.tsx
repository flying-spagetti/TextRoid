import { MoveRight, PhoneCall } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function CTA() {
  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col text-center bg-muted rounded-md p-4 lg:p-14 gap-8 items-center">
          <div>
            <Badge>Explore GPT</Badge>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular">
              Dive into GPT Transformers
            </h3>
            <p className="text-lg leading-relaxed tracking-tight text-muted-foreground max-w-xl">
              Join the Kognitiv Club's project, led by Gnaneswar, Surya, and Sreelekha, to delve into the world of GPT transformers. Learn about their architecture and capabilities in this group project.
            </p>
          </div>
          <div className="flex flex-row gap-4">
          <Link href="/haha">
            <Button className="gap-4" variant="outline">
              
              Discuss with the team <PhoneCall className="w-4 h-4" />
              
            </Button>
            </Link>
            <Link href="/haha">
            <Button className="gap-4">
              
              Learn more <MoveRight className="w-4 h-4" />
              
            </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { CTA };
