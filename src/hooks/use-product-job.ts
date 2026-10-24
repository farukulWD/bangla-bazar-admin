import { useGetProductJobQuery } from "@/store/api/product/api/productApi";

const POLL_MS = 1500;
const DONE = new Set(["completed", "failed"]);

export const useProductJob = (jobId: string | null) => {
  const { data: job, error } = useGetProductJobQuery(jobId ?? "", {
    skip: !jobId,
    pollingInterval: POLL_MS,
    skipPollingIfUnfocused: false,
  });
  const live = jobId && job?.id === jobId ? job : undefined;
  const done = Boolean(live && DONE.has(live.state)) || Boolean(error);

  return { job: live, error, done };
};
