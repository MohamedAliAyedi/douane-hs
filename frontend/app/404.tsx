import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";

export default function NotFound({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="page_404">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 ">
            <div className="col-sm-10 col-sm-offset-1 text-center">
              <div className="contat404">
                <div className="four_zero_four_bg">
                  <h1 className="text-center ">404</h1>
                </div>
                <h3 className="h2">{title}</h3>
                <p>{description}</p>
                <Link href="/dashboard" passHref>
                  <Button
                    className="justify-start mb-2 bg-blue-600 hover:bg-blue-700 mt-2"
                  >
                     Go to Home
                  </Button>
                </Link>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
