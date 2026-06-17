import { useAuth } from "../context/AuthContext";
import ParentDashboard from "./ParentDashboard";
import KidHome from "./KidHome";

export default function Home() {
  const { role } = useAuth();
  return role === "parent" ? <ParentDashboard /> : <KidHome />;
}
