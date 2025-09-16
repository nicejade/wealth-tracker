

export default {
  "meta": {},
  "id": "_default",
  "_regex": {},
  "_paramKeys": {},
  "file": {
    "path": "src/routes",
    "dir": "src",
    "base": "routes",
    "ext": "",
    "name": "routes"
  },
  "rootName": "default",
  "routifyDir": import.meta.url,
  "children": [
    {
      "meta": {},
      "id": "_default_Advice_svelte",
      "_regex": {},
      "_paramKeys": {},
      "name": "Advice",
      "file": {
        "path": "src/routes/Advice.svelte",
        "dir": "src/routes",
        "base": "Advice.svelte",
        "ext": ".svelte",
        "name": "Advice"
      },
      "asyncModule": () => import('../src/routes/Advice.svelte'),
      "children": []
    },
    {
      "meta": {},
      "id": "_default_Detail_svelte",
      "_regex": {},
      "_paramKeys": {},
      "name": "Detail",
      "file": {
        "path": "src/routes/Detail.svelte",
        "dir": "src/routes",
        "base": "Detail.svelte",
        "ext": ".svelte",
        "name": "Detail"
      },
      "asyncModule": () => import('../src/routes/Detail.svelte'),
      "children": []
    },
    {
      "meta": {},
      "id": "_default_Index_svelte",
      "_regex": {},
      "_paramKeys": {},
      "name": "Index",
      "file": {
        "path": "src/routes/Index.svelte",
        "dir": "src/routes",
        "base": "Index.svelte",
        "ext": ".svelte",
        "name": "Index"
      },
      "asyncModule": () => import('../src/routes/Index.svelte'),
      "children": []
    },
    {
      "meta": {},
      "id": "_default_Insights_svelte",
      "_regex": {},
      "_paramKeys": {},
      "name": "Insights",
      "file": {
        "path": "src/routes/Insights.svelte",
        "dir": "src/routes",
        "base": "Insights.svelte",
        "ext": ".svelte",
        "name": "Insights"
      },
      "asyncModule": () => import('../src/routes/Insights.svelte'),
      "children": []
    },
    {
      "meta": {},
      "id": "_default_Status_svelte",
      "_regex": {},
      "_paramKeys": {},
      "name": "Status",
      "file": {
        "path": "src/routes/Status.svelte",
        "dir": "src/routes",
        "base": "Status.svelte",
        "ext": ".svelte",
        "name": "Status"
      },
      "asyncModule": () => import('../src/routes/Status.svelte'),
      "children": []
    },
    {
      "meta": {
        "dynamic": true,
        "dynamicSpread": true
      },
      "_regex": {},
      "_paramKeys": {},
      "name": "[...404]",
      "file": {
        "path": ".routify/components/[...404].svelte",
        "dir": ".routify/components",
        "base": "[...404].svelte",
        "ext": ".svelte",
        "name": "[...404]"
      },
      "asyncModule": () => import('./components/[...404].svelte'),
      "children": []
    }
  ]
}