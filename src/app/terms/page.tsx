
import { LegalPageLayout } from '@/components/legal-page-layout';

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service">
      <p>Last Updated: {new Date().toLocaleDateString()}</p>

      <h2 className="text-2xl font-bold mt-8 mb-4">1. Introduction</h2>
      <p>
        Welcome to Don't Forget the Oranges! These Terms of Service ("Terms") govern your use of our website, mobile application, and the services we provide (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">2. The Service</h2>
      <p>
        Don't Forget the Oranges provides a smart grocery list application. Our core feature uses Artificial Intelligence (AI) to analyze images of handwritten notes, receipts, or screenshots that you upload. The AI extracts grocery items, categorizes them, and adds them to your digital list within the app.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">3. User Accounts</h2>
      <p>
        You may need to register for an account to access some or all of our Service. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">4. User Content</h2>
      <p>
        When you upload an image to our Service ("User Content"), you retain all your rights to it. However, by using our Service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, process, and display your User Content solely for the purpose of providing and improving the Service. This includes using the data to train our AI models to better understand grocery lists. We will never share your specific images or lists with third parties.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">5. Disclaimer</h2>
      <p>
        The Service is provided "as is." Our AI, while powerful, may occasionally make mistakes in interpreting your lists. We do not warrant that the extracted information will be 100% accurate. You are responsible for verifying the items on your list before shopping. Don't Forget the Oranges is not responsible for any items forgotten or incorrectly added.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">6. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, Don't Forget the Oranges, Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, resulting from your use of the Service.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">7. Changes to Terms</h2>
      <p>
        We may modify these Terms from time to time. We will provide notice of changes by posting the new Terms on our site. Your continued use of the Service after any modification constitutes your acceptance of the new Terms.
      </p>

       <h2 className="text-2xl font-bold mt-8 mb-4">8. Contact Us</h2>
      <p>
        If you have any questions about these Terms, please contact us at contact@dontforgettheoranges.com.
      </p>
    </LegalPageLayout>
  );
}
