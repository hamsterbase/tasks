import UIKit
import Capacitor

class TasksViewController: CAPBridgeViewController {
    
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(BackForwardGesturesPlugin())
        bridge?.registerPluginInstance(AboutPlugin())
    }
}

