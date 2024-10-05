import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForAccessToken, getAccountDetails } from "~/lib/aurinko";
import { db } from "~/server/db";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json(
      {
        message: "Unauthorized",
        success: false,
      },
      {
        status: 401,
      },
    );

  const params = req.nextUrl.searchParams;
  const status = params.get("status");
  if (status !== "success")
    return NextResponse.json(
      {
        message: "Failed to link account",
        success: false,
      },
      {
        status: 400,
      },
    );

  // Get the code from the params to exchange for the access Token
  const code = params.get("code");
  if (!code)
    return NextResponse.json(
      {
        message: "No code provided",
        success: false,
      },
      {
        status: 400,
      },
    );
  const token = await exchangeCodeForAccessToken(code);
  if (!token)
    return NextResponse.json(
      {
        message: "Failed to exchange code for access token",
        success: false,
      },
      {
        status: 400,
      },
    );

    const accountDetails = await getAccountDetails(token.accessToken);

    // Save data to our own database
    await db.account.upsert({
      where: { id: token.accountId.toString() },
      create: {
        id: token.accountId.toString(),
        userId,
        token: token.accessToken,
        emailAddress: accountDetails.email,
        name: accountDetails.name,
      },
      update: {
        token: token.accessToken,
      },
    });

    return NextResponse.redirect(new URL("/mail", req.url));
};
