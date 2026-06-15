import SafetyMap from "../components/map/SafetyMap";
import { useAuth } from "../context/AuthContext";

export default function MapPage() {
  const { user } = useAuth();
  return <SafetyMap city={user?.city || "Chennai"} />;
}