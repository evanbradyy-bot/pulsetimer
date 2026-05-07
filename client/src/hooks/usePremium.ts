import { trpc } from "@/lib/trpc";

export function usePremium() {
  const { data, isLoading } = trpc.premium.getStatus.useQuery();
  const setPremiumMutation = trpc.premium.setPremium.useMutation();

  const setPremium = async (isPremium: boolean) => {
    await setPremiumMutation.mutateAsync({ isPremium });
  };

  return {
    isPremium: data?.isPremium || false,
    isLoading,
    setPremium,
  };
}
