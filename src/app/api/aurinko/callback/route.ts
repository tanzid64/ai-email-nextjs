import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForAccessToken, getAccountDetails } from "~/lib/aurinko";

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
};
