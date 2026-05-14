import { redirect } from "next/navigation";

// DEV MODE: password disabled — go straight to data
export default function CollaboratorsPage() {
  redirect("/projects/object-based-attention/collaborators/data");
}
