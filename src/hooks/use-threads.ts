import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";
import {atom, useAtom} from 'jotai'

export const threadIdAtom = atom<string | null>(null);

export const useThreads = () => {
  const { data: accounts } = api.account.getAccounts.useQuery();
  const [accountId] = useLocalStorage("accountId", "");
  const [tab] = useLocalStorage("imail-tab", "inbox");
  const [done] = useLocalStorage("imail-done", false);
  const [threadId, setThreadId] = useAtom(threadIdAtom);

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
    setThreadId,
    threadId,
    accountId,
    account: accounts?.find((account) => account.id === accountId),
  };
};

