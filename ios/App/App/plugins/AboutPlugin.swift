import Foundation
import Capacitor

@objc(AboutPlugin)
public class AboutPlugin: CAPPlugin,CAPBridgedPlugin {
    public let identifier = "AboutPlugin"
    public let jsName = "About"
    
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "showAbout", returnType: CAPPluginReturnPromise),
    ]
    
    @objc func showAbout(_ call: CAPPluginCall) {
        let showICP = call.getBool("showICP", false)
        let displayMode = call.getString("displayMode", "light")

        
        DispatchQueue.main.async {
            if let appDelegate = UIApplication.shared.delegate as? AppDelegate {
                appDelegate.showAbout(showICP: showICP,displayMode:displayMode)
                call.resolve()
            } else {
                call.reject("Failed to show about page")
            }
        }
    }
} 
