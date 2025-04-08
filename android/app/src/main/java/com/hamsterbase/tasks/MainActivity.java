package com.hamsterbase.tasks;

import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {


  @Override
  public void onStart() {
    super.onStart();
    // https://github.com/ionic-team/capacitor/issues/5384
    WebView v = getBridge().getWebView();
    v.setOverScrollMode(v.OVER_SCROLL_NEVER);
  }
}
