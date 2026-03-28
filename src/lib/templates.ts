const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  max-width: 560px; margin: 0 auto; padding: 2rem;
  background: #1a1a1a; color: #e0e0e0; border-radius: 12px;
`;

const buttonStyle = `
  display: inline-block; padding: 0.75rem 1.5rem;
  background: #fff; color: #0a0a0a; text-decoration: none;
  border-radius: 8px; font-weight: 600; font-size: 0.9375rem;
`;

export function verificationEmail(variables: Record<string, string>): string {
  return `
    <div style="${baseStyle}">
      <h1 style="color: #fff; font-size: 1.25rem;">Verify your email</h1>
      <p style="color: #999; margin: 1rem 0;">Click below to verify your email address for LSHworkspace.</p>
      <a href="${variables.verifyUrl}" style="${buttonStyle}">Verify Email</a>
      <p style="color: #666; font-size: 0.75rem; margin-top: 2rem;">If you didn't create an account, ignore this email.</p>
    </div>
  `;
}

export function passwordResetEmail(variables: Record<string, string>): string {
  return `
    <div style="${baseStyle}">
      <h1 style="color: #fff; font-size: 1.25rem;">Reset your password</h1>
      <p style="color: #999; margin: 1rem 0;">Click below to reset your password. This link expires in 1 hour.</p>
      <a href="${variables.resetUrl}" style="${buttonStyle}">Reset Password</a>
      <p style="color: #666; font-size: 0.75rem; margin-top: 2rem;">If you didn't request this, ignore this email.</p>
    </div>
  `;
}

export function welcomeEmail(variables: Record<string, string>): string {
  return `
    <div style="${baseStyle}">
      <h1 style="color: #fff; font-size: 1.25rem;">Welcome to LSHworkspace</h1>
      <p style="color: #999; margin: 1rem 0;">Hi ${variables.username}, your account has been created successfully.</p>
      <a href="https://lshworkspace.com" style="${buttonStyle}">Visit LSHworkspace</a>
    </div>
  `;
}

export function notificationEmail(variables: Record<string, string>): string {
  return `
    <div style="${baseStyle}">
      <h1 style="color: #fff; font-size: 1.25rem;">${variables.title || "Notification"}</h1>
      <p style="color: #999; margin: 1rem 0;">${variables.message || ""}</p>
    </div>
  `;
}

export const templates: Record<string, (vars: Record<string, string>) => string> = {
  verification: verificationEmail,
  "password-reset": passwordResetEmail,
  welcome: welcomeEmail,
  notification: notificationEmail,
};
