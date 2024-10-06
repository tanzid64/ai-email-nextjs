import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";

const useThreads = () => {
  const { data: accounts } = api.account.getAccounts.useQuery();
  const [accountId] = useLocalStorage("accountId", "");
  const [tab] = useLocalStorage("imail-tab", "inbox");
  const [done] = useLocalStorage("imail-done", false);

  const {
    data: threads,
    isFetching,
    refetch,
  } = api.account.getThreads.useQuery(
    {
      accountId,
      tab: tab,
      done: done,
    },
    {
      enabled: !!accountId && !!tab,
      placeholderData: (e) => e,
      refetchInterval: 5000,
    },
  );

  return {
    threads,
    isFetching,
    refetch,
    accountId,
    account: accounts?.find((account) => account.id === accountId),
  };
};

export default useThreads;
