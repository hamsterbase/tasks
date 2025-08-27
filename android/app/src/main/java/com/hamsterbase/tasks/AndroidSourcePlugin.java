package com.hamsterbase.tasks;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AndroidSource")
public class AndroidSourcePlugin extends Plugin {

    @PluginMethod
    public void getSource(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("source", BuildConfig.ANDROID_SOURCE);
        call.resolve(ret);
    }
}