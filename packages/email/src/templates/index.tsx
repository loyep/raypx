import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import type { ReactElement } from "react";

/**
 * Base email props
 */
interface BaseEmailProps {
  preview: string;
  children: React.ReactNode;
}

/**
 * Base email layout component
 */
export function BaseEmail({ preview, children }: BaseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto my-8 max-w-xl rounded-lg bg-white p-8 shadow-sm">
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

/**
 * Email header with logo
 */
interface EmailHeaderProps {
  logoUrl?: string;
  companyName?: string;
}

export function EmailHeader({ logoUrl, companyName = "Raypx" }: EmailHeaderProps) {
  return (
    <Section className="mb-6 text-center">
      {logoUrl ? (
        <Img alt={companyName} className="mx-auto h-12" src={logoUrl} />
      ) : (
        <Heading className="font-bold text-2xl text-gray-900">{companyName}</Heading>
      )}
    </Section>
  );
}

/**
 * Email footer
 */
interface EmailFooterProps {
  companyName?: string;
  unsubscribeUrl?: string;
}

export function EmailFooter({ companyName = "Raypx", unsubscribeUrl }: EmailFooterProps) {
  return (
    <>
      <Hr className="my-6 border-gray-200" />
      <Section className="text-center text-gray-500 text-sm">
        <Text className="m-0">
          &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
        </Text>
        {unsubscribeUrl && (
          <Text className="mt-2">
            <Link className="text-gray-400 underline" href={unsubscribeUrl}>
              Unsubscribe
            </Link>
          </Text>
        )}
      </Section>
    </>
  );
}

/**
 * Welcome email template
 */
interface WelcomeEmailProps {
  name: string;
  loginUrl?: string;
  companyName?: string;
  logoUrl?: string;
}

export function WelcomeEmail({
  name,
  loginUrl,
  companyName = "Raypx",
  logoUrl,
}: WelcomeEmailProps): ReactElement {
  return (
    <BaseEmail preview={`Welcome to ${companyName}!`}>
      <EmailHeader companyName={companyName} logoUrl={logoUrl} />
      <Heading className="font-semibold text-gray-900 text-xl">Welcome, {name}!</Heading>
      <Text className="mt-4 text-gray-600">
        Thank you for joining {companyName}. We're excited to have you on board!
      </Text>
      {loginUrl && (
        <Section className="mt-6 text-center">
          <Button className="rounded-lg bg-blue-600 px-6 py-3 text-white" href={loginUrl}>
            Get Started
          </Button>
        </Section>
      )}
      <EmailFooter companyName={companyName} />
    </BaseEmail>
  );
}

/**
 * Verification email template
 */
interface VerificationEmailProps {
  name: string;
  verificationCode: string;
  verificationUrl?: string;
  expiresIn?: string;
  companyName?: string;
  logoUrl?: string;
}

export function VerificationEmail({
  name,
  verificationCode,
  verificationUrl,
  expiresIn = "24 hours",
  companyName = "Raypx",
  logoUrl,
}: VerificationEmailProps): ReactElement {
  return (
    <BaseEmail preview="Verify your email address">
      <EmailHeader companyName={companyName} logoUrl={logoUrl} />
      <Heading className="font-semibold text-gray-900 text-xl">Verify your email</Heading>
      <Text className="mt-4 text-gray-600">Hi {name},</Text>
      <Text className="text-gray-600">
        Please use the following code to verify your email address:
      </Text>
      <Section className="my-6 text-center">
        <Text className="font-bold text-3xl text-gray-900 tracking-widest">{verificationCode}</Text>
      </Section>
      <Text className="text-gray-500 text-sm">This code will expire in {expiresIn}.</Text>
      {verificationUrl && (
        <Section className="mt-4 text-center">
          <Text className="text-gray-600">Or click the button below to verify:</Text>
          <Button
            className="mt-2 rounded-lg bg-blue-600 px-6 py-3 text-white"
            href={verificationUrl}
          >
            Verify Email
          </Button>
        </Section>
      )}
      <EmailFooter companyName={companyName} />
    </BaseEmail>
  );
}

/**
 * Password reset email template
 */
interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
  expiresIn?: string;
  companyName?: string;
  logoUrl?: string;
}

export function PasswordResetEmail({
  name,
  resetUrl,
  expiresIn = "1 hour",
  companyName = "Raypx",
  logoUrl,
}: PasswordResetEmailProps): ReactElement {
  return (
    <BaseEmail preview="Reset your password">
      <EmailHeader companyName={companyName} logoUrl={logoUrl} />
      <Heading className="font-semibold text-gray-900 text-xl">Reset your password</Heading>
      <Text className="mt-4 text-gray-600">Hi {name},</Text>
      <Text className="text-gray-600">
        We received a request to reset your password. Click the button below to create a new
        password:
      </Text>
      <Section className="my-6 text-center">
        <Button className="rounded-lg bg-blue-600 px-6 py-3 text-white" href={resetUrl}>
          Reset Password
        </Button>
      </Section>
      <Text className="text-gray-500 text-sm">
        This link will expire in {expiresIn}. If you didn't request this, you can safely ignore this
        email.
      </Text>
      <EmailFooter companyName={companyName} />
    </BaseEmail>
  );
}

/**
 * Email verification link template (for Better Auth / sign-up verification)
 */
interface EmailVerificationLinkProps {
  name: string;
  verificationUrl: string;
  companyName?: string;
  logoUrl?: string;
}

export function EmailVerificationLink({
  name,
  verificationUrl,
  companyName = "Raypx",
  logoUrl,
}: EmailVerificationLinkProps): ReactElement {
  return (
    <BaseEmail preview="Verify your email address">
      <EmailHeader companyName={companyName} logoUrl={logoUrl} />
      <Heading className="font-semibold text-gray-900 text-xl">Verify your email</Heading>
      <Text className="mt-4 text-gray-600">Hi {name},</Text>
      <Text className="text-gray-600">
        Thanks for signing up! Please click the button below to verify your email address:
      </Text>
      <Section className="my-6 text-center">
        <Button className="rounded-lg bg-blue-600 px-6 py-3 text-white" href={verificationUrl}>
          Verify Email
        </Button>
      </Section>
      <Text className="text-gray-500 text-sm">
        If you didn't create an account, you can safely ignore this email.
      </Text>
      <EmailFooter companyName={companyName} />
    </BaseEmail>
  );
}

/**
 * Delete account verification email template
 */
interface DeleteAccountEmailProps {
  name: string;
  deleteUrl: string;
  expiresIn?: string;
  companyName?: string;
  logoUrl?: string;
}

export function DeleteAccountEmail({
  name,
  deleteUrl,
  expiresIn = "24 hours",
  companyName = "Raypx",
  logoUrl,
}: DeleteAccountEmailProps): ReactElement {
  return (
    <BaseEmail preview="Confirm account deletion">
      <EmailHeader companyName={companyName} logoUrl={logoUrl} />
      <Heading className="font-semibold text-gray-900 text-xl">Delete your account</Heading>
      <Text className="mt-4 text-gray-600">Hi {name},</Text>
      <Text className="text-gray-600">
        We received a request to permanently delete your account. Click the button below to confirm
        and complete the deletion:
      </Text>
      <Section className="my-6 text-center">
        <Button className="rounded-lg bg-red-600 px-6 py-3 text-white" href={deleteUrl}>
          Delete Account
        </Button>
      </Section>
      <Text className="text-gray-500 text-sm">
        This link will expire in {expiresIn}. If you didn't request this, you can safely ignore this
        email and your account will remain active.
      </Text>
      <EmailFooter companyName={companyName} />
    </BaseEmail>
  );
}

/**
 * Export all templates
 */
export const emailTemplates = {
  welcome: WelcomeEmail,
  verification: VerificationEmail,
  verificationLink: EmailVerificationLink,
  passwordReset: PasswordResetEmail,
  deleteAccount: DeleteAccountEmail,
};
