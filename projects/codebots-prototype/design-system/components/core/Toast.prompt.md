Bottom-center toast for gentle redirects ("Finish Mission 01 to unlock this one, cadet."). Auto-dismiss ~2.4s in app code. Friendly voice, never scolding.

```jsx
<Toast visible={!!msg}>{msg}</Toast>
```
