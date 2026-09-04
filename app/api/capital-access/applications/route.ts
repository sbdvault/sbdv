import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateCapitalTerms,
  MIN_REQUEST_USD,
  MAX_REQUEST_USD,
  MIN_TERM_YEARS,
  MAX_TERM_YEARS,
  type RepaymentFrequency,
} from "@/lib/capital-access";
import { sendCapitalAccessSubmissionEmails } from "@/lib/capital-access-emails";
import { sendOnboardingPhaseEmail } from "@/lib/capital-access-onboarding-emails";
import { hasRequiredDocuments } from "@/lib/capital-access-onboarding";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const applications = await prisma.capitalAccessRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        pool: { select: { country: true, region: true, category: true } },
        documents: { select: { type: true } },
      },
    });

    return NextResponse.json({
      applications: applications.map((a) => ({
        ...a,
        docsComplete: hasRequiredDocuments(a.documents.map((d) => d.type)),
        needsDocuments:
          a.onboardingPhase === "AWAITING_DOCUMENTS" ||
          a.onboardingPhase === "DOCUMENTS_REVISION",
        documentsAwaitingReview: a.onboardingPhase === "DOCUMENTS_SUBMITTED",
      })),
    });
  } catch (err) {
    console.error("GET capital access applications:", err);
    return NextResponse.json({ error: "Failed to load applications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "BORROWER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Capital Access account required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      poolId,
      companyName,
      companyRegistration,
      country,
      industry,
      investmentAreas,
      financialsSummary,
      annualRevenueUsd,
      requestedAmountUsd,
      termYears,
      repaymentFrequency,
      termsAccepted,
    } = body;

    if (
      !poolId ||
      !companyName?.trim() ||
      !companyRegistration?.trim() ||
      !country ||
      !industry?.trim() ||
      !investmentAreas?.trim() ||
      !financialsSummary?.trim() ||
      !requestedAmountUsd ||
      !termYears ||
      !repaymentFrequency ||
      !termsAccepted
    ) {
      return NextResponse.json({ error: "All required fields must be completed" }, { status: 400 });
    }

    const amount = parseFloat(requestedAmountUsd);
    const term = parseInt(termYears, 10);

    if (amount < MIN_REQUEST_USD || amount > MAX_REQUEST_USD) {
      return NextResponse.json(
        { error: `Request must be between $${MIN_REQUEST_USD.toLocaleString()} and $${MAX_REQUEST_USD.toLocaleString()}` },
        { status: 400 }
      );
    }

    if (term < MIN_TERM_YEARS || term > MAX_TERM_YEARS) {
      return NextResponse.json({ error: "Invalid loan term" }, { status: 400 });
    }

    const pool = await prisma.globalWealthEntity.findUnique({ where: { id: poolId } });
    if (!pool) {
      return NextResponse.json({ error: "Capital pool not found" }, { status: 404 });
    }

    const terms = calculateCapitalTerms(
      amount,
      term,
      repaymentFrequency as RepaymentFrequency
    );

    const application = await prisma.capitalAccessRequest.create({
      data: {
        userId: session.user.id,
        poolId,
        companyName: companyName.trim(),
        companyRegistration: companyRegistration.trim(),
        country,
        industry: industry.trim(),
        investmentAreas: investmentAreas.trim(),
        financialsSummary: financialsSummary.trim(),
        annualRevenueUsd: parseFloat(annualRevenueUsd) || 0,
        requestedAmountUsd: amount,
        termYears: term,
        repaymentFrequency,
        interestRatePct: terms.interestRatePct,
        securityDepositPct: terms.securityDepositPct,
        securityDepositUsd: terms.securityDepositUsd,
        totalInterestUsd: terms.totalInterestUsd,
        installmentUsd: terms.installmentUsd,
        termsAccepted: true,
        status: "PENDING",
        onboardingPhase: "AWAITING_DOCUMENTS",
        relationshipManager: "Capital Access Desk",
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true },
    });

    if (user?.email) {
      sendCapitalAccessSubmissionEmails({
        applicationId: application.id,
        borrowerEmail: user.email,
        borrowerName: user.name,
        companyName: application.companyName,
        poolCountry: pool.country,
        poolCategory: pool.category,
        requestedAmountUsd: application.requestedAmountUsd,
        interestRatePct: application.interestRatePct,
        termYears: application.termYears,
        securityDepositUsd: application.securityDepositUsd,
        repaymentFrequency: application.repaymentFrequency,
      }).catch((err) => console.error("Submission email error:", err));

      sendOnboardingPhaseEmail(
        user.email,
        user.name,
        application.companyName,
        "AWAITING_DOCUMENTS"
      ).catch(console.error);
    }

    return NextResponse.json({ application }, { status: 201 });
  } catch (err) {
    console.error("POST capital access application:", err);
    return NextResponse.json(
      { error: "Failed to submit application. Please restart the server if this persists." },
      { status: 500 }
    );
  }
}
