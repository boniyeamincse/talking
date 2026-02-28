import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class BaniTalkTheme {
  static const Color bg = Color(0xFF080C14);
  static const Color bg2 = Color(0xFF0D1120);
  static const Color surface = Color(0xFF111827);
  static const Color surface2 = Color(0xFF1A2236);
  static const Color primary = Color(0xFF7C6AF7);
  static const Color accent = Color(0xFFF472B6);
  static const Color textBody = Color(0xFFEEF2FF);
  static const Color textSecondary = Color(0xFF94A3B8);

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bg,
      colorScheme: const ColorScheme.dark(
        primary: primary,
        secondary: accent,
        surface: surface,
        background: bg,
      ),
      textTheme: GoogleFonts.plusJakartaSansTextTheme().apply(
        bodyColor: textBody,
        displayColor: textBody,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: bg,
        elevation: 0,
        titleTextStyle: TextStyle(
          color: textBody,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: bg2,
        selectedItemColor: primary,
        unselectedItemColor: textSecondary,
      ),
    );
  }
}
