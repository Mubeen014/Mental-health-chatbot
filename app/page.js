import { options } from "./api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Home from "./pages/Home";

export default async function HomePage() {
  const session = await getServerSession(options);
  console.log('Session:', session)

  if (!session) {
    redirect('/api/auth/signin');
  } 
  return <Home />
}
