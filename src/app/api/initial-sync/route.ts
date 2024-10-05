import { NextRequest, NextResponse } from "next/server";
import { Account } from "~/lib/account";
import { syncEmailsToDatabase } from "~/lib/sync-to-db";
import { db } from "~/server/db";

export const POST = async (req: NextRequest) => {
  const { accountId, userId } = await req.json();
  if (!accountId || !userId)
    return NextResponse.json(
      { message: "Missing Account Id or User Id" },
      { status: 400 },
    );

  // Search for the account in our database
  const dbAccount = await db.account.findUnique({
    where: { id: accountId, userId },
  });

  if (!dbAccount)
    return NextResponse.json({ message: "Account not found" }, { status: 404 });

  // Perform initial sync
  const account = new Account(dbAccount.token);
  // await account.createSubscription();
  const response = await account.performInitialSync();
  if (!response)
    return NextResponse.json({ error: "FAILED_TO_SYNC" }, { status: 500 });

  const { deltaToken, emails } = response;

  await syncEmailsToDatabase(emails, accountId);

  await db.account.update({
    where: {
      token: dbAccount.token,
    },
    data: {
      nextDeltaToken: deltaToken,
    },
  });
  console.log("sync complete", deltaToken);
  return NextResponse.json({ success: true, deltaToken }, { status: 200 });
};
