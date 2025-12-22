import { Link } from 'react-router-dom';
import { Shield, Lock, Key, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';

const SecurityPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/essential-information"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to Essential Information
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-50 rounded-xl">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Security Policy
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Last updated: December 22, 2025
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-red-600" />
                Our Commitment to Security
              </h2>
              <p className="text-gray-700 leading-relaxed">
                At iLaunching, we take the security of your data and account seriously. This Security Policy 
                outlines our practices regarding support access permissions, data protection measures, and 
                our commitment to maintaining the highest standards of security.
              </p>
            </section>

            {/* Support Access Permissions */}
            <section className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Key className="w-6 h-6 text-red-600" />
                Support Access Permissions
              </h2>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">What are Login Permissions?</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Login permissions allow our trained Support Specialists to temporarily access your 
                        account to troubleshoot specific issues you raise in a support ticket. This access is 
                        strictly controlled and monitored.
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">When Support Access is Used:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Technical Issues:</strong> When you experience technical problems that cannot 
                      be resolved through standard troubleshooting steps.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Data Recovery:</strong> When you need assistance recovering or restoring your data.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Configuration Help:</strong> When complex configuration changes require direct 
                      access to implement properly.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Bug Investigation:</strong> When investigating reported bugs that require 
                      examination of your specific account setup.
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Security Safeguards */}
            <section className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-red-600" />
                Security Safeguards
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement multiple layers of security to protect your account when support access is granted:
                </p>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Explicit Consent Required</h4>
                      <p className="text-gray-700 text-sm mt-1">
                        Support access is only granted when you explicitly enable login permissions in your 
                        account settings. You maintain full control.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Audit Logging</h4>
                      <p className="text-gray-700 text-sm mt-1">
                        Every support access session is fully logged and auditable. You can review access 
                        history in your security settings.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Time-Limited Access</h4>
                      <p className="text-gray-700 text-sm mt-1">
                        Support sessions are time-limited and automatically expire after the issue is resolved 
                        or after a maximum duration.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Trained Specialists Only</h4>
                      <p className="text-gray-700 text-sm mt-1">
                        Only certified and trained support specialists who have undergone background checks 
                        and security training can access accounts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Read-Only When Possible</h4>
                      <p className="text-gray-700 text-sm mt-1">
                        Whenever possible, support access is granted in read-only mode. Write access is only 
                        provided when absolutely necessary and with your explicit permission.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Instant Revocation</h4>
                      <p className="text-gray-700 text-sm mt-1">
                        You can revoke login permissions at any time, immediately terminating all active 
                        support sessions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Protection */}
            <section className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-red-600" />
                Data Protection Measures
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  Beyond support access controls, we implement comprehensive security measures to protect 
                  your data:
                </p>

                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span><strong>Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span><strong>Access Controls:</strong> Multi-factor authentication and role-based access controls.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span><strong>Regular Audits:</strong> Independent security audits and penetration testing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span><strong>Compliance:</strong> SOC 2 Type II and GDPR compliant infrastructure.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span><strong>Monitoring:</strong> 24/7 security monitoring and intrusion detection.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Your Rights and Controls */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights and Controls</h2>
              
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  You have complete control over support access permissions:
                </p>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-gray-900">✓ Enable or disable login permissions at any time</p>
                  <p className="font-semibold text-gray-900">✓ View complete access history and logs</p>
                  <p className="font-semibold text-gray-900">✓ Receive notifications when support accesses your account</p>
                  <p className="font-semibold text-gray-900">✓ Request deletion of access logs (subject to legal requirements)</p>
                  <p className="font-semibold text-gray-900">✓ File complaints or concerns with our security team</p>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gray-50 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Questions or Concerns?</h3>
              <p className="text-gray-700 mb-4">
                If you have any questions about our security policy or concerns about account access, 
                please contact our security team:
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:security@ilaunching.com"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  <Shield className="w-4 h-4" />
                  Contact Security Team
                </a>
                <Link
                  to="/support"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                >
                  Get Support
                </Link>
              </div>
            </section>
          </div>
        </div>

        {/* Related Policies */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Policies</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/legal/privacy"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">Privacy Policy</div>
                <div className="text-xs text-gray-600">How we protect your data</div>
              </div>
            </Link>
            <Link
              to="/legal/terms"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Terms of Use</div>
                <div className="text-xs text-gray-600">Service terms and conditions</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPolicy;
