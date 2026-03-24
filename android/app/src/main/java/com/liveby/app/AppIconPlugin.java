package com.liveby.app;

import android.content.ComponentName;
import android.content.pm.PackageManager;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AppIcon")
public class AppIconPlugin extends Plugin {

    private static final String PKG = "com.liveby.app";

    private static final String[] ALL_ALIASES = {
        PKG + ".MainActivityScoreNone",
        PKG + ".MainActivityScoreBad",
        PKG + ".MainActivityScorePoor",
        PKG + ".MainActivityScoreOk",
        PKG + ".MainActivityScoreGood",
        PKG + ".MainActivityScorePerfect",
    };

    @PluginMethod
    public void setScoreIcon(PluginCall call) {
        float score = call.getFloat("score", 0f);
        String target = scoreToAlias(score);
        try {
            PackageManager pm = getContext().getPackageManager();
            // Enable target first so there is never a gap with zero launcher entries
            pm.setComponentEnabledSetting(
                new ComponentName(PKG, target),
                PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                PackageManager.DONT_KILL_APP
            );
            for (String alias : ALL_ALIASES) {
                if (!alias.equals(target)) {
                    pm.setComponentEnabledSetting(
                        new ComponentName(PKG, alias),
                        PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                        PackageManager.DONT_KILL_APP
                    );
                }
            }
        } catch (Exception ignored) {}
        call.resolve();
    }

    private String scoreToAlias(float score) {
        if (score == 0)   return PKG + ".MainActivityScoreNone";
        if (score < 2.5f) return PKG + ".MainActivityScoreBad";
        if (score < 5f)   return PKG + ".MainActivityScorePoor";
        if (score < 7.5f) return PKG + ".MainActivityScoreOk";
        if (score < 10f)  return PKG + ".MainActivityScoreGood";
        return PKG + ".MainActivityScorePerfect";
    }
}
