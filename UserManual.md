# DOT - Email Builder User Manual

Welcome to the **DOT - Email Builder**, a professional-grade tool designed to streamline the creation of modular, responsive, and brand-compliant HTML emails. This guide will walk you through the features and functionalities to help you build high-quality email templates optimized for **Power Automate**.

---

## 1. Interface Overview

The application is designed for speed and clarity, featuring a dual-pane layout:

### The Editor Sidebar (Left)
This is your command center. Here you can:
- **Add Modules**: Use the "ADD" button to choose from over 12 different module types.
- **Configure Content**: Each module has specific fields (URLs, text, colors) tailored to its design.
- **Organize Structure**: Drag modules between the "Main Body" (inside the white container) and "Outside Body" (the footer area).

### The Preview Area (Right)
A real-time view of your email:
- **Preview Tab**: See exactly how the email looks.
- **HTML Tab**: View the raw, formatted code.
- **Dark Mode Toggle**: Simulate Outlook’s "Dark Mode" to ensure your design remains readable in all environments.
- **Copy Code**: One-click export to your clipboard.

![[Image Description: A full screenshot of the application showing the Editor Sidebar on the left with several modules active, and the Preview Area on the right showing a matching email layout.]]

---

## 2. Working with Modules

### Adding and Managing
1. Click the **ADD** button in the top left.
2. Select a module from the dropdown (e.g., Banner, KPI Cards, Checklist).
3. **Duplicate**: Click the "Duplicate" icon next to a module's header to clone it with all current settings.
4. **Reorder**: Use the "Up" and "Down" arrows to move modules. Moving a module past the "Main Body" boundary will automatically shift it to the "Outside Body" section.
5. **Delete**: Click the "Trash" icon to remove a module permanently.

### Module Types
- **Header Logo**: Pre-configured with official department logos.
- **Banner**: A high-impact title block with customizable background colors.
- **Delivery Phase**: A visual tracker for project progress (Assess, Design, Develop, etc.).
- **KPI Cards**: Perfect for reporting metrics with color-coded status indicators.
- **Two Column**: A flexible responsive layout that allows you to choose either text or an image for each column independently.
- **Checklist**: Multiple icon options (Blue squares, arrows, stars) for listing tasks or features.
- **Legal**: Pre-filled with standard Uniper company information.

![[Image Description: Close-up of the Module Editor showing the 'Delivery Phase' selector and 'KPI Cards' metric inputs.]]

---

## 3. Formatting and Shortcuts

The editor supports powerful keyboard shortcuts for rich text formatting directly within text areas and inputs. Highlight your text and use the following keys:

| Shortcut | Action | HTML Tag Generated |
| :--- | :--- | :--- |
| **Ctrl + B** | **Bold** | `<b>text</b>` |
| **Ctrl + I** | *Italic* | `<i>text</i>` |
| **Ctrl + U** | <u>Underline</u> | `<u>text</u>` |
| **Ctrl + S** | ~~Strike~~ | `<s>text</s>` |
| **Ctrl + K** | Insert Link | `<a href="URL" style="...">text</a>` |
| **Ctrl + E** | **Insert Expression** | `@{replace('!!!','REFERENCE')}` |

> **Pro Tip**: Use the **Insert Expr.** button next to labels to quickly add Power Automate dynamic expressions without typing.

---

## 4. Power Automate Integration

This tool is built specifically for **Power Automate** users.

1. Assemble your email structure in the builder.
2. Use **Ctrl + E** or the "Insert Expr." button to place placeholders like `@{variables('MyVariable')}` directly into the text fields.
3. Switch to the **HTML** tab.
4. Click **Copy Code**.
5. In your Power Automate "Send an email (V2)" action, switch to the code view (`</>`) and paste the content.

![[Image Description: An illustration showing the flow from the Email Builder HTML code being pasted into a Power Automate 'Send an email' action block.]]

---

## 5. Dark Mode Simulation

Outlook’s Dark Mode can drastically change how colors appear. Our **Dark Mode Simulation** uses the exact color palette utilized by Outlook's rendering engine:
- **Background**: `#292929`
- **Text**: `#D7D7D7`
- **Brand Blue**: Stays `#0078DC` for consistency.

Always toggle this mode before exporting to ensure your images (especially those with transparency) and text colors contrast correctly.

---

## 6. Troubleshooting & Best Practices

- **Image CIDs**: If you are embedding images in Power Automate, use the format `cid:ImageName.png` in the Image URL field.
- **Hex Colors**: The builder accepts standard hex codes (e.g., `#0078DC`).
- **Responsive Width**: The main container is fixed at **640px**, which is the industry standard for maximum compatibility across desktop and mobile clients.
- **Version Tracking**: Check the bottom-right corner for the current `APP_VERSION` to ensure you are using the latest features.

---
*Created by the DOT Team. For support, please contact the Business Solutions department.*