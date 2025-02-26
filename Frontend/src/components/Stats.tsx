import { Card, CardContent } from "@/components/ui/card";

const metrics = [
  { title: "Factual Accuracy", value: "39.13%", description: "Might as well consult a fortune cookie.", status: "text-red-500" },
  { title: "Semantic Similarity", value: "0.37", description: "Even my grandma’s handwriting is clearer.", status: "text-red-500" },
  { title: "Perplexity", value: "143.05", description: "Yep, the AI is as confused as we are.", status: "text-red-500" },
  { title: "Grammar Errors", value: "0.00", description: "At least we got this one right!", status: "text-green-500" },
  { title: "Inference Time", value: "1.52s", description: "Not lightning fast, but hey, it tries.", status: "text-yellow-500" },
  { title: "Memory Usage", value: "0.00MB", description: "Wait... is it even thinking?", status: "text-green-500" },
  { title: "Hallucination Rate", value: "60.87%", description: "Basically, it's a creative writer now.", status: "text-red-500" },
  { title: "Summarization Quality (ROUGE-L)", value: "0.09", description: "Even a 10 year old would do better.", status: "text-red-500" }
];

export default function EvaluationMetrics() {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4">
      <h2 className="text-2xl font-bold mb-4 text-center">AI Evaluation Metrics</h2>
      <p className="text-sm text-muted-foreground mb-6 text-center">
        The numbers don't lie, and, well... neither do we. Brace yourself.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
        {metrics.map((metric, index) => (
          <Card key={index} className="p-4 text-center">
            <CardContent>
              <h3 className="text-xl font-semibold">{metric.title}</h3>
              <p className={`text-2xl font-bold ${metric.status}`}>{metric.value}</p>
              <p className="text-sm text-muted-foreground mt-2">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 p-4 bg-muted rounded-md text-center max-w-md">
        <h3 className="text-2xl font-semibold mb-2">What Does This Mean?</h3>
        <p className="text-xl text-muted-foreground">
          Our AI is doing its best, but let's be honest—if it were a student, it'd be failing most subjects except creative writing.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Just embrace the chaos and use it for comedy gold.
        </p>
      </div>
    </div>
  );
}
