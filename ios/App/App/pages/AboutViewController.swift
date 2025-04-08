import UIKit
import StoreKit

class AboutViewController: UIViewController {
    
    private let logoImageView: UIImageView = {
        let imageView = UIImageView()
        imageView.contentMode = .scaleAspectFit
        imageView.translatesAutoresizingMaskIntoConstraints = false
        imageView.layer.cornerRadius = 24
        imageView.clipsToBounds = true
        return imageView
    }()
    
    private let tableView: UITableView = {
        let tableView = UITableView(frame: .zero, style: .insetGrouped)
        tableView.translatesAutoresizingMaskIntoConstraints = false
        tableView.isScrollEnabled = false
        return tableView
    }()
    
    private var showICP: Bool = false
    private var displayMode: String
    
    private enum Section: Int, CaseIterable {
        case info
        case actions
    }
    
    private enum InfoRow: Int, CaseIterable {
        case version
        case icp
    }
    
    private enum ActionRow: Int, CaseIterable {
        case rate
    }
    
    init(showICP: Bool = false, displayMode: String) {
        self.showICP = showICP
        self.displayMode = displayMode
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
    }
    
    private func setupUI() {
        // Set background color based on display mode
        if displayMode == "dark" {
            view.backgroundColor = UIColor(red: 23/255, green: 23/255, blue: 26/255, alpha: 1.0) // #17171a
            tableView.backgroundColor = UIColor(red: 23/255, green: 23/255, blue: 26/255, alpha: 1.0) // #17171a
        } else {
            view.backgroundColor = .systemGroupedBackground
            tableView.backgroundColor = .systemGroupedBackground
        }
        
        // Add logo image
        if let logoImage = UIImage(named: "AppIcon") {
            logoImageView.image = logoImage
        } else {
            print("Failed to load AppIcon-512@2x image")
        }
        view.addSubview(logoImageView)
        
        // Setup table view
        tableView.delegate = self
        tableView.dataSource = self
        view.addSubview(tableView)
        
        setupConstraints()
    }
    
    private func setupConstraints() {
        NSLayoutConstraint.activate([
            logoImageView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            logoImageView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 60),
            logoImageView.widthAnchor.constraint(equalToConstant: 100),
            logoImageView.heightAnchor.constraint(equalToConstant: 100),
            
            tableView.topAnchor.constraint(equalTo: logoImageView.bottomAnchor, constant: 40),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor)
        ])
    }
    
    private func handleRateApp() {
        if let scene = view.window?.windowScene {
            SKStoreReviewController.requestReview(in: scene)
        }
    }
}

// MARK: - UITableViewDataSource
extension AboutViewController: UITableViewDataSource {
    func numberOfSections(in tableView: UITableView) -> Int {
        return Section.allCases.count
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        switch Section(rawValue: section) {
        case .info:
            return showICP ? InfoRow.allCases.count : 1
        case .actions:
            return ActionRow.allCases.count
        case .none:
            return 0
        }
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = UITableViewCell(style: .value1, reuseIdentifier: "Cell")
        
        // Configure cell background color based on display mode
        if displayMode == "dark" {
            cell.backgroundColor = UIColor(red: 30/255, green: 30/255, blue: 33/255, alpha: 1.0) // #1e1e21
        } else {
            cell.backgroundColor = .secondarySystemGroupedBackground
        }
        
        switch Section(rawValue: indexPath.section) {
        case .info:
            switch InfoRow(rawValue: indexPath.row) {
            case .version:
                cell.textLabel?.text = "Version"
                cell.detailTextLabel?.text = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? ""
                cell.selectionStyle = .none
            case .icp:
                cell.textLabel?.text = "ICP"
                cell.detailTextLabel?.text = "闽ICP备2023022904号-4A"
                cell.selectionStyle = .none
            case .none:
                break
            }
        case .actions:
            switch ActionRow(rawValue: indexPath.row) {
            case .rate:
                cell.textLabel?.text = "Rate App"
                cell.detailTextLabel?.text = nil
                cell.selectionStyle = .default
            case .none:
                break
            }
        case .none:
            break
        }
        
        // Configure colors based on display mode
        if displayMode == "dark" {
            cell.textLabel?.textColor = UIColor(red: 231/255, green: 233/255, blue: 235/255, alpha: 1.0) // #e7e9eb
            cell.detailTextLabel?.textColor = UIColor(red: 162/255, green: 167/255, blue: 174/255, alpha: 1.0) // #a2a7ae
        } else {
            cell.textLabel?.textColor = .label
            cell.detailTextLabel?.textColor = .secondaryLabel
        }
        
        return cell
    }
}

// MARK: - UITableViewDelegate
extension AboutViewController: UITableViewDelegate {
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        
        switch Section(rawValue: indexPath.section) {
        case .actions:
            switch ActionRow(rawValue: indexPath.row) {
            case .rate:
                handleRateApp()
            case .none:
                break
            }
        default:
            break
        }
    }
} 