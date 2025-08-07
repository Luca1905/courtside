import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { api } from "~/convex/_generated/api";
import PlayerDetailsPage from "../player/[id]";

export default function Profile() {
  const router = useRouter();
  const playerId = useQuery(api.players.getForCurrentUser);

  useEffect(() => {
    router.setParams({ id: playerId?._id });
  }, [router, playerId]);

  return <PlayerDetailsPage />;
}
