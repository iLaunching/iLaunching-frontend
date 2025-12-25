import { Link } from 'react-router-dom';
import { FileText, Shield, Lock, Scale, Info, ChevronRight, AlertTriangle } from 'lucide-react';

const EssentialInformation = () => {
  const legalSections = [
    {
      id: 'terms',
      title: 'Terms of Use',
      description: 'Our terms and conditions for using iLaunching services',
      icon: FileText,
      color: 'blue',
      link: '/legal/terms'
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      description: 'How we collect, use, and protect your personal information',
      icon: Shield,
      color: 'green',
      link: '/legal/privacy'
    },
    {
      id: 'data',
      title: 'Data Protection',
      description: 'Our commitment to keeping your data safe and secure',
      icon: Lock,
      color: 'purple',
      link: '/legal/data-protection'
    },
    {
      id: 'compliance',
      title: 'Legal Compliance',
      description: 'Regulatory compliance and legal obligations',
      icon: Scale,
      color: 'orange',
      link: '/legal/compliance'
    },
    {
      id: 'cookies',
      title: 'Cookie Policy',
      description: 'How we use cookies and similar technologies',
      icon: Info,
      color: 'pink',
      link: '/legal/cookies'
    },
    {
      id: 'security-policy',
      title: 'Security Policy',
      description: 'Our security practices and support access permissions',
      icon: Lock,
      color: 'red',
      link: '/legal/security-policy'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; hover: string }> = {
      blue: { bg: 'bg-blue-50', icon: 'text-blue-600', hover: 'hover:bg-blue-100' },
      green: { bg: 'bg-green-50', icon: 'text-green-600', hover: 'hover:bg-green-100' },
      purple: { bg: 'bg-purple-50', icon: 'text-purple-600', hover: 'hover:bg-purple-100' },
      orange: { bg: 'bg-orange-50', icon: 'text-orange-600', hover: 'hover:bg-orange-100' },
      pink: { bg: 'bg-pink-50', icon: 'text-pink-600', hover: 'hover:bg-pink-100' },
      red: { bg: 'bg-red-50', icon: 'text-red-600', hover: 'hover:bg-red-100' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Essential Information
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access all legal and policy information in one place. Read about our terms, 
              privacy practices, and compliance commitments.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Legal Sections Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {legalSections.map((section) => {
            const colors = getColorClasses(section.color);
            const IconComponent = section.icon;
            
            return (
              <Link
                key={section.id}
                id={section.id}
                to={section.link}
                className={`group block p-6 bg-white rounded-2xl shadow-sm border border-gray-200 transition-all duration-200 ${colors.hover} hover:shadow-md`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 p-3 ${colors.bg} rounded-xl transition-transform duration-200 group-hover:scale-110`}>
                    <IconComponent className={`w-6 h-6 ${colors.icon}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                        {section.title}
                      </h3>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
                    </div>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Additional Information */}
        <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Need More Information?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                If you have questions about our legal policies or need clarification on any topic, 
                our support team is here to help.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:legal@ilaunching.com"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Contact Legal Team
                </a>
                <a
                  href="/support"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                >
                  Get Support
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Membership Section */}
        <div id="delete-membership" className="mt-8 p-6 bg-red-50 rounded-2xl border-2 border-red-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Account Deletion Notice
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Your account has been scheduled for deletion and access has been revoked. 
                Your data will be permanently removed after the 30-day grace period.
              </p>
              <div className="p-4 bg-white rounded-lg border border-red-200">
                <h4 className="font-semibold text-gray-900 mb-2">What happens next:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>Your account access has been immediately revoked</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>All your data will be permanently deleted after 30 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>You will receive a confirmation email with the deletion date</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>This action cannot be reversed</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Need help?</strong> If you have questions about your account deletion or need assistance, 
                  please contact our support team at <a href="mailto:support@ilaunching.com" className="underline font-semibold">support@ilaunching.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Last updated: November 19, 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default EssentialInformation;
