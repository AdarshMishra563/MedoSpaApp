package com.medospaapp

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the app theme *before* super.onCreate to apply splash screen
    setTheme(R.style.AppTheme) // AppTheme defined in styles.xml
    super.onCreate(savedInstanceState)
  }

  override fun getMainComponentName(): String = "MedoSpaApp"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
