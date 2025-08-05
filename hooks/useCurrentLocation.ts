import { useEffect, useState } from "react";
import * as Location from "expo-location";

type UseCurrentLocationReturn = {
  location: Location.LocationObject | null;
  error: string | null;
  isLoading: boolean;
};

export function useCurrentLocation(): UseCurrentLocationReturn {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          if (isMounted) {
            setError("Permission to access location was denied");
            setIsLoading(false);
          }
          return;
        }

        const current = await Location.getCurrentPositionAsync({});
        if (isMounted) {
          setLocation(current);
        }
      } catch (err) {
        if (isMounted) {
          setError((err as Error).message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return { location, error, isLoading };
}
