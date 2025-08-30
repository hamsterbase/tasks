package com.hamsterbase.tasks;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.method.LinkMovementMethod;
import android.text.style.ClickableSpan;
import android.text.style.ForegroundColorSpan;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

public class PrivacyPolicyActivity extends Activity {
    
    private static final String PREFS_NAME = "PrivacyPolicyPrefs";
    private static final String KEY_PRIVACY_ACCEPTED = "privacy_policy_accepted";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 如果不需要显示隐私政策，直接跳转到MainActivity
        if (!shouldShowPrivacyPolicy()) {
            Intent intent = new Intent(this, MainActivity.class);
            startActivity(intent);
            finish();
            return;
        }
        
        LinearLayout mainLayout = new LinearLayout(this);
        mainLayout.setOrientation(LinearLayout.VERTICAL);
        mainLayout.setPadding(50, 80, 50, 50);
        mainLayout.setBackgroundColor(Color.WHITE);
        
        TextView titleView = new TextView(this);
        titleView.setText("用户协议及隐私政策");
        titleView.setTextSize(20);
        titleView.setTextColor(Color.BLACK);
        titleView.setGravity(Gravity.CENTER);
        titleView.setPadding(0, 0, 0, 60);
        titleView.setTypeface(titleView.getTypeface(), android.graphics.Typeface.BOLD);
        
        TextView contentView = new TextView(this);
        String content = "在使用 APP 之前，需要了解《用户协议》和《隐私政策》, 点击\"同意\"即表示您确认已阅读并同意上述两份文件。";
        
        SpannableString spannableString = new SpannableString(content);
        
        int userAgreementStart = content.indexOf("《用户协议》");
        int userAgreementEnd = userAgreementStart + "《用户协议》".length();
        spannableString.setSpan(new ClickableSpan() {
            @Override
            public void onClick(View widget) {
                showDocument("用户协议", getUserAgreementContent());
            }
        }, userAgreementStart, userAgreementEnd, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        spannableString.setSpan(new ForegroundColorSpan(Color.BLUE), userAgreementStart, userAgreementEnd, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        
        int privacyPolicyStart = content.indexOf("《隐私政策》");
        int privacyPolicyEnd = privacyPolicyStart + "《隐私政策》".length();
        spannableString.setSpan(new ClickableSpan() {
            @Override
            public void onClick(View widget) {
                showDocument("隐私政策", getPrivacyPolicyContent());
            }
        }, privacyPolicyStart, privacyPolicyEnd, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        spannableString.setSpan(new ForegroundColorSpan(Color.BLUE), privacyPolicyStart, privacyPolicyEnd, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        
        contentView.setText(spannableString);
        contentView.setTextSize(16);
        contentView.setTextColor(Color.parseColor("#666666"));
        contentView.setMovementMethod(LinkMovementMethod.getInstance());
        contentView.setPadding(20, 0, 20, 80);
        contentView.setLineSpacing(0, 1.3f);
        contentView.setGravity(Gravity.CENTER);
        
        LinearLayout buttonLayout = new LinearLayout(this);
        buttonLayout.setOrientation(LinearLayout.HORIZONTAL);
        buttonLayout.setGravity(Gravity.CENTER);
        buttonLayout.setPadding(20, 0, 20, 0);
        
        Button disagreeButton = new Button(this);
        disagreeButton.setText("不同意");
        disagreeButton.setTextColor(Color.parseColor("#666666"));
        disagreeButton.setBackgroundColor(Color.parseColor("#F5F5F5"));
        disagreeButton.setTextSize(16);
        LinearLayout.LayoutParams disagreeParams = new LinearLayout.LayoutParams(0, 120, 1);
        disagreeParams.rightMargin = 30;
        disagreeButton.setLayoutParams(disagreeParams);
        
        Button agreeButton = new Button(this);
        agreeButton.setText("同意");
        agreeButton.setTextColor(Color.WHITE);
        agreeButton.setBackgroundColor(Color.parseColor("#007AFF"));
        agreeButton.setTextSize(16);
        LinearLayout.LayoutParams agreeParams = new LinearLayout.LayoutParams(0, 120, 1);
        agreeParams.leftMargin = 30;
        agreeButton.setLayoutParams(agreeParams);
        
        buttonLayout.addView(disagreeButton);
        buttonLayout.addView(agreeButton);
        
        ScrollView scrollView = new ScrollView(this);
        LinearLayout scrollContent = new LinearLayout(this);
        scrollContent.setOrientation(LinearLayout.VERTICAL);
        scrollContent.addView(titleView);
        scrollContent.addView(contentView);
        scrollView.addView(scrollContent);
        
        mainLayout.addView(scrollView);
        mainLayout.addView(buttonLayout);
        
        setContentView(mainLayout);
        
        disagreeButton.setOnClickListener(v -> {
            finish();
            System.exit(0);
        });
        
        agreeButton.setOnClickListener(v -> {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().putBoolean(KEY_PRIVACY_ACCEPTED, true).apply();
            
            Intent intent = new Intent(this, MainActivity.class);
            startActivity(intent);
            finish();
        });
    }
    
    @Override
    public void onBackPressed() {
    }
    
    private boolean shouldShowPrivacyPolicy() {
        if (!BuildConfig.ANDROID_SOURCE.equals("xiaomi")) {
            return false;
        }
        
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return !prefs.getBoolean(KEY_PRIVACY_ACCEPTED, false);
    }
    
    private void showDocument(String title, String content) {
        LinearLayout documentLayout = new LinearLayout(this);
        documentLayout.setOrientation(LinearLayout.VERTICAL);
        documentLayout.setPadding(40, 60, 40, 40);
        documentLayout.setBackgroundColor(Color.WHITE);
        
        // 顶部导航栏
        LinearLayout headerLayout = new LinearLayout(this);
        headerLayout.setOrientation(LinearLayout.HORIZONTAL);
        headerLayout.setPadding(0, 0, 0, 20);
        headerLayout.setGravity(Gravity.CENTER_VERTICAL);
        
        Button backButton = new Button(this);
        backButton.setText("返回");
        backButton.setTextColor(Color.WHITE);
        backButton.setBackgroundColor(Color.parseColor("#007AFF"));
        backButton.setTextSize(14);
        LinearLayout.LayoutParams backParams = new LinearLayout.LayoutParams(200, 100);
        backParams.setMargins(0, 10, 0, 0);
        backButton.setLayoutParams(backParams);
        
        TextView titleView = new TextView(this);
        titleView.setText(title);
        titleView.setTextSize(18);
        titleView.setTextColor(Color.BLACK);
        titleView.setGravity(Gravity.CENTER);
        titleView.setTypeface(titleView.getTypeface(), android.graphics.Typeface.BOLD);
        LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1);
        titleView.setLayoutParams(titleParams);
        
        // 占位空间保持对称
        View spacer = new View(this);
        LinearLayout.LayoutParams spacerParams = new LinearLayout.LayoutParams(200, 100);
        spacer.setLayoutParams(spacerParams);
        
        headerLayout.addView(backButton);
        headerLayout.addView(titleView);
        headerLayout.addView(spacer);
        
        ScrollView scrollView = new ScrollView(this);
        TextView contentView = new TextView(this);
        contentView.setText(content);
        contentView.setTextSize(14);
        contentView.setTextColor(Color.parseColor("#333333"));
        contentView.setPadding(20, 0, 20, 20);
        contentView.setLineSpacing(0, 1.4f);
        scrollView.addView(contentView);
        
        documentLayout.addView(headerLayout);
        documentLayout.addView(scrollView);
        
        setContentView(documentLayout);
        
        backButton.setOnClickListener(v -> onCreate(null));
    }
    
    private String getUserAgreementContent() {
        return "HamsterBase Tasks 最终用户许可协议 (EULA)\n\n" +
                "一、协议概述\n\n" +
                "本最终用户许可协议（以下简称\"协议\"或\"EULA\"）是您（个人或实体，以下简称\"用户\"或\"您\"）与厦门康达通科技有限公司（以下简称\"HamsterBase\"或\"我们\"）之间就 HamsterBase Tasks 软件（以下简称\"软件\"）使用达成的具有法律约束力的协议。通过下载、安装、访问或使用本软件，您确认已阅读、理解并同意接受本协议的所有条款和条件。\n\n" +
                "二、许可授权\n\n" +
                "1. 授权范围：HamsterBase 授予您非独占、不可转让的许可，允许您按照本协议条款使用本软件。\n" +
                "2. 使用权限：您可以在您拥有或控制的设备上安装、使用和运行本软件。\n" +
                "3. 许可类型：根据您购买的许可类型，您的使用权限可能存在差异。\n\n" +
                "三、所有权与知识产权\n\n" +
                "1. 所有权：本软件及其所有组件（包括但不限于源代码、图像、数据和内容）的所有权和知识产权均归 HamsterBase 所有。\n" +
                "2. 保留权利：除本协议明确授予您的权利外，本软件的所有其他权利均由 HamsterBase 保留。\n\n" +
                "四、使用限制\n\n" +
                "1. 禁止行为：您不得：\n" +
                "   - 复制、修改、改编、翻译或创建本软件的衍生作品\n" +
                "   - 对本软件进行反向工程、反编译或试图获取源代码\n" +
                "   - 移除或更改本软件中的任何版权声明或商标\n" +
                "   - 出租、租赁、出借、销售、分发或转授权本软件\n" +
                "   - 以违反适用法律法规的方式使用本软件\n\n" +
                "五、隐私与数据\n\n" +
                "1. 数据收集：本软件可能收集与您使用相关的数据，具体收集内容和使用方式详见《隐私政策》。\n" +
                "2. 数据存储：您通过软件创建或存储的内容归您所有，您应对其合法性负责。\n" +
                "3. 数据保护：我们将采取合理措施保护您的数据安全，但不对因网络或系统故障导致的数据损失承担责任。\n\n" +
                "六、软件更新\n\n" +
                "1. 更新权利：HamsterBase 可能不时提供软件更新，您可选择是否安装。\n" +
                "2. 自动更新：本软件可能会自动下载并安装更新，以优化功能和安全性。\n" +
                "3. 协议适用性：除非更新附带单独的许可协议，否则本协议同样适用于所有更新。\n\n" +
                "七、担保免责\n\n" +
                "1. 软件提供方式：本软件按\"现状\"提供，不提供任何形式的明示或暗示担保。\n" +
                "2. 性能保证：HamsterBase 不保证软件无错误、能满足您的特定需求、与其他软件兼容或运行不间断。\n" +
                "3. 使用风险：使用本软件的风险完全由您自行承担。\n\n" +
                "八、终止条款\n\n" +
                "1. 终止条件：如您违反本协议任何条款，HamsterBase 有权立即终止您使用本软件的许可。\n" +
                "2. 终止后义务：许可终止后，您必须停止使用本软件并销毁所有副本。\n" +
                "3. 存续条款：与所有权、责任限制、担保免责相关的条款在协议终止后仍然有效。\n\n" +
                "九、责任限制\n\n" +
                "1. 间接损失：HamsterBase、其许可方、子公司或雇员在任何情况下均不对因使用或无法使用本软件而导致的任何特殊、附带、间接、侵权、经济或惩罚性损害负责，包括但不限于利润、业务或数据的损失，即使已被告知可能发生该等损害。\n" +
                "2. 直接损失：无论在任何情况下，HamsterBase 对财产或人员的直接损害（无论是一次或多次发生）的累计责任，均不超过您为本软件支付金额的 1 倍（如您免费获得本软件则为零美元）。上述免责及限制条款不适用于与死亡或人身伤害相关的索赔。对于不允许排除或限制损害的司法管辖区，HamsterBase 的责任将以该司法管辖区允许的最大范围为限。\n\n" +
                "十、第三方软件\n\n" +
                "本软件可能包含第三方软件组件，这些组件受其各自的许可条款约束。本协议不改变您对这些第三方软件的使用权利和义务。\n\n" +
                "十一、出口管制\n\n" +
                "您同意遵守所有适用的国内和国际出口法律法规，不会将本软件出口或再出口到禁止的国家、个人或实体。\n\n" +
                "十二、完整协议\n\n" +
                "本协议构成您与 HamsterBase 之间关于本软件使用的完整协议，取代之前或同期的所有口头或书面通信、提议和陈述。\n\n" +
                "十三、可分割性\n\n" +
                "如本协议的任何条款被认定为无效或不可执行，该条款应在最小必要范围内被修改，以使其可执行，其余条款仍具完全效力。\n\n" +
                "十四、法律与管辖\n\n" +
                "本协议于上海市徐汇区签订。如双方就本协议内容或其执行发生争议（包括但不限于合同或其他财产权益争议），双方应通过友好协商解决；如协商不成，双方同意将争议提交上海市徐汇区人民法院管辖和处理。\n\n" +
                "十五、联系方式\n\n" +
                "如您对本协议有任何问题，请通过以下方式联系我们：厦门康达通科技有限公司电子邮件：support@hamsterbase.com";
    }
    
    private String getPrivacyPolicyContent() {
        return "隐私协议\n\n" +
                "我们是谁\n\n" +
                "HamsterBase Tasks 由厦门康达通科技有限公司负责运营。我们的开发团队位于上海，这座城市的咖啡文化为我们的工作提供了动力。\n\n" +
                "我们收集什么\n\n" +
                "如果您选择创建账户，我们将收集以下信息：\n\n" +
                "1. 邮箱和加密的密码（我们不会以明文形式存储密码）\n" +
                "2. 如果购买了 VIP，我们可能会存储您的电子邮件地址作为支付证明\n\n" +
                "如果您不注册账户，我们不会收集任何个人信息。\n\n" +
                "我们如何存储您的数据\n\n" +
                "所有收集的数据均存储在腾讯云的安全服务器中。我们采用行业标准的安全措施来保护您的信息。\n\n" +
                "设备权限和传感器\n\n" +
                "我们的应用程序使用某些设备传感器和权限来提供最佳的用户体验：\n\n" +
                "加速度传感器：用于检测设备方向变化，确保应用界面能够正确适配横屏和竖屏模式\n" +
                "• 界面适配：根据设备方向调整应用布局\n" +
                "• 屏幕适配：确保内容在不同屏幕类型上正确显示\n" +
                "• 应用稳定性：维护应用正常运行状态\n\n" +
                "数据处理方式：\n" +
                "• 本地处理：传感器数据仅在设备本地处理，用于实时UI调整\n" +
                "• 不会将传感器原始数据发送到远程服务器\n" +
                "• 数据存储：传感器数据不会被永久存储，仅在应用运行期间临时使用\n\n" +
                "数据共享\n\n" +
                "除了提供服务所必需的情况外，我们不会与任何第三方共享、出售或提供您的数据。这包括：\n\n" +
                "1. 支付处理商（Paddle 和 RevenueCat）用于处理订阅交易\n\n" +
                "我们只收集和共享提供服务和确保良好用户体验所必需的最少数据。\n\n" +
                "服务提供商\n\n" +
                "Paddle\n" +
                "如果您通过我们的网站购买专业版订阅，我们使用 Paddle 作为支付服务提供商。Paddle 会收集您的姓名、电子邮件地址和支付信息。请查看 Paddle 的隐私政策：https://www.paddle.com/legal/privacy。\n\n" +
                "RevenueCat\n" +
                "如果您在 iOS 或 Android 上购买专业版订阅，我们使用 RevenueCat 来管理应用内购买。RevenueCat 可能会收集：\n\n" +
                "- 终端用户技术信息：关于您设备的技术详情，包括设备类型和操作系统\n" +
                "- 终端用户交易信息：与您的购买相关的数据，包括：\n" +
                "  - 您最后一次使用我们应用的时间\n" +
                "  - Apple 收据文件（iOS）\n" +
                "  - Google 购买令牌（Android）\n" +
                "- 可选的终端用户信息：如果启用，这可能包括：\n" +
                "  - 您在我们应用中的用户 ID\n" +
                "  - 与您账户相关的其他归因或元数据\n\n" +
                "有关 RevenueCat 数据处理的完整详情，请查看他们的隐私政策：https://www.revenuecat.com/privacy。\n\n" +
                "您的权利\n\n" +
                "您有权访问、更正或删除您的个人数据。您也可以随时撤销对数据收集的同意。\n\n" +
                "协议的变更\n\n" +
                "我们可能会不时更新本隐私协议。如有重大变更，我们将通知您。\n\n" +
                "联系我们\n\n" +
                "如果您对我们的隐私政策、我们的做法或我们的任何法律文件有疑问或关切，请通过以下电子邮件联系我们：privacy@hamsterbase.com。";
    }
}