import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }
    
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    func showAbout(showICP: Bool = false, displayMode: String) {
        let aboutVC = AboutViewController(showICP: showICP, displayMode: displayMode)
        let navController = UINavigationController(rootViewController: aboutVC)
        aboutVC.navigationItem.leftBarButtonItem = UIBarButtonItem(title: "Close", style: .plain, target: self, action: #selector(dismissAbout))
        
        if let rootViewController = window?.rootViewController {
            rootViewController.present(navController, animated: true)
        }
    }
    
    @objc private func dismissAbout() {
        window?.rootViewController?.dismiss(animated: true)
    }

}
