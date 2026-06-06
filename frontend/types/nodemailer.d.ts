declare module "nodemailer" {
  export type Transporter = {
    sendMail(message: {
      from: string;
      to: string;
      subject: string;
      text: string;
      html?: string;
    }): Promise<unknown>;
  };

  const nodemailer: {
    createTransport(server: string): Transporter;
  };

  export default nodemailer;
}
