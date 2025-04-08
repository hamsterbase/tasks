import Foundation
import Capacitor
import WebKit

@objc(BackForwardGesturesPlugin)
public class BackForwardGesturesPlugin: CAPPlugin,CAPBridgedPlugin {
    public let identifier = "BackForwardGesturesPlugin"
    public let jsName = "BackForwardGestures"
    
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setEnabled", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isEnabled", returnType: CAPPluginReturnPromise)
    ]
    
    @objc func setEnabled(_ call: CAPPluginCall) {
        guard let enabled = call.getBool("enabled") else {
            call.reject("Missing enabled parameter")
            return
        }
        
        DispatchQueue.main.async {
            if let webView = self.bridge?.webView as? WKWebView {
                webView.allowsBackForwardNavigationGestures = enabled
                call.resolve()
            } else {
                call.reject("WebView not found")
            }
        }
    }
    
    @objc func isEnabled(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let webView = self.bridge?.webView as? WKWebView {
                call.resolve([
                    "enabled": webView.allowsBackForwardNavigationGestures
                ])
            } else {
                call.reject("WebView not found")
            }
        }
    }
}
