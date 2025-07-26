
import { LegalPageLayout } from '@/components/legal-page-layout';

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <p>Last Updated: {new Date().toLocaleDateString()}</p>

      <h2 className="text-2xl font-bold mt-8 mb-4">1. Introduction</h2>
      <p>
        Don't Forget the Oranges, Inc. ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our Service.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">2. Information We Collect</h2>
      <h3 className="text-xl font-semibold mt-4 mb-2">A. Information You Provide to Us</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Grocery List Images:</strong> When you use our AI-powered uploader, we collect the images of grocery lists, receipts, or notes that you provide.
        </li>
        <li>
          <strong>Manually Entered Data:</strong> We collect the information you manually enter into the app, such as item names, categories, prices, and quantities.
        </li>
        <li>
          <strong>Account Information:</strong> If you create an account, we collect information such as your email and password.
        </li>
      </ul>

      <h3 className="text-xl font-semibold mt-4 mb-2">B. Information We Do Not Collect</h3>
       <ul className="list-disc pl-6 space-y-2">
        <li>
          We do not collect personal information from your images beyond what is necessary to extract grocery items. We do not analyze handwriting to identify individuals or extract any non-grocery-related text.
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">3. How We Use Your Information</h2>
      <p>We use the information we collect for the following purposes:</p>
      <ul className="list-disc pl-6 space-y-2 mt-4">
        <li>
          <strong>To Provide the Service:</strong> We use your uploaded images and data to provide the core functionality of the app—digitizing your grocery lists.
        </li>
        <li>
          <strong>To Improve our AI:</strong> The data extracted from your lists (item names, categories, etc.) is used in an anonymized and aggregated form to train and improve the accuracy of our AI models. We do not use your personal account information for model training.
        </li>
        <li>
          <strong>To Communicate with You:</strong> We may use your account information to send you service-related announcements.
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">4. Data Storage and Security</h2>
      <p>
        We take reasonable measures to protect your information from unauthorized access or disclosure. Your data, including images and list items, is stored on secure servers.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">5. Data Sharing</h2>
       <p>
        We do not sell, rent, or share your personal information with third parties for their marketing purposes. Your data is only used to provide the service as described in this policy.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">6. Your Rights</h2>
      <p>
        You can access and delete the items and lists stored in your account at any time through the app. If you delete your account, we will also delete your associated data from our systems.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">7. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">8. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us at privacy@dontforgettheoranges.com.
      </p>
    </LegalPageLayout>
  );
}
