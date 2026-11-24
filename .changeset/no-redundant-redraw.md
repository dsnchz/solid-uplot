---
"@dschz/solid-uplot": patch
---

A newly created chart no longer gets `setData` and `setSize` calls repeating the data and size it was just created with, which saves a redundant redraw on every (re)creation.
