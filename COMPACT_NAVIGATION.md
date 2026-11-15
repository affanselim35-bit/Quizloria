# Compact section navigation

On screens up to 760px, the sticky navigation shows Home, Tests and a Menu disclosure. Desktop keeps Games and Profile directly visible as well. The remaining existing anchors move into one responsive panel; IDs, data-view handlers, membership visibility and the admin visibility contract are preserved. No duplicate navigation destinations or account changes are introduced.

The disclosure exposes aria-expanded/aria-controls, supports normal Tab order and Escape, closes on navigation/outside interaction/focus leaving the navigation, and restores focus when closing a keyboard-selected link. Resizing reuses the same anchors and closes the panel. Current sections inside the menu are indicated on the toggle; pending duel notifications remain discoverable via a dot and accessible label. Without JavaScript the original navigation links remain visible.

Validation: 93 local emulator/browser checks at 320, 390 and 1280px cover height, links, dismissal, keyboard focus, hidden paid/admin links, notification updates, resizing, identity of existing IDs and unchanged catalogue access. The 111 guide/route checks exercise all nine engines with the enhanced navigation loaded. No real accounts, answers, payments or scores are created.
