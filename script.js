var tasks = [
    { 
        id: 1, 
        name: "Create user dashboard", 
        desc: "Build the analytics dashboard for end users.", 
        priority: "high", 
        status: "todo", 
        date: "2026-03-20" 
    },
    { 
        id: 2, 
        name: "Design homepage wireframe", 
        desc: "Create low-fi wireframes for the new landing page.", 
        priority: "low", 
        status: "in-progress", 
        date: "2026-03-10" 
    },
    { 
        id: 3, 
        name: "Performance audit", 
        desc: "Run Lighthouse and fix critical issues.", 
        priority: "medium", 
        status: "in-progress", 
        date: "2026-03-07" 
    },
    { 
        id: 4, 
        name: "Write unit tests", 
        desc: "Cover auth and payment modules with tests.", 
        priority: "medium", 
        status: "done", 
        date: "2026-03-02" 
    },
    { 
        id: 5, 
        name: "Update dependencies", 
        desc: "Bump all packages to latest stable versions.", 
        priority: "low", 
        status: "done", 
        date: "2026-03-03" 
    }
]

var filter = "all"
var search = ""
var sort = "date"
var nextId = 6

var taskGrid = document.getElementById("taskGrid")

function longDate(str) {
    if (!str) return "No date"
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    var p = str.split("-")
    return months[parseInt(p[1]) - 1] + " " + parseInt(p[2]) + ", " + p[0]
}

function statusLabel(s) {
    if (s == "todo") return "To Do"
    if (s == "in-progress") return "In Progress"
    return "Completed"
}

function updateStats() {
    var total = tasks.length
    var inProgress = 0
    var done = 0
    var overdue = 0

    for (var i = 0; i < tasks.length; i++) {
        var t = tasks[i]
        if (t.status == "in-progress") inProgress++
        if (t.status == "done") done++
        if (t.status != "done" && t.date && new Date(t.date) < new Date()) overdue++
    }

    document.getElementById("statTotal").textContent = total
    document.getElementById("statInProgress").textContent = inProgress
    document.getElementById("statDone").textContent = done
    document.getElementById("statOverdue").textContent = overdue
    document.getElementById("statTotalSub").textContent = total + " tasks total"
    document.getElementById("statInProgressSub").textContent = inProgress + " active now"
    document.getElementById("statDoneSub").textContent = (total > 0 ? Math.round(done / total * 100) : 0) + "% completion rate"
}

function sortTasks(list) {
    for (var i = 0; i < list.length - 1; i++) {
        for (var j = i + 1; j < list.length; j++) {
            var swap = false

            if (sort === "name" && list[i].name > list[j].name) {
                swap = true
            } else if (sort === "priority") {
                var order = { high: 0, medium: 1, low: 2 }
                if (order[list[i].priority] > order[list[j].priority]) swap = true
            } else if (sort === "date") {
                if (!list[i].date) { swap = true; continue }
                if (!list[j].date) { swap = false; continue }
                if (list[i].date > list[j].date) swap = true
            }

            if (swap) {
                var temp = list[i]
                list[i] = list[j]
                list[j] = temp
            }
        }
    }
}

function renderTasks() {
    taskGrid.innerHTML = ""

    var list = []
    for (var i = 0; i < tasks.length; i++) {
        if (filter == "all" || tasks[i].status == filter) {
            list.push(tasks[i])
        }
    }

    if (search != "") {
        var results = []
        for (var i = 0; i < list.length; i++) {
            if (list[i].name.toLowerCase().indexOf(search.toLowerCase()) != -1 ||
                list[i].desc.toLowerCase().indexOf(search.toLowerCase()) != -1) {
                results.push(list[i])
            }
        }
        list = results
    }

    sortTasks(list)

    if (list.length == 0) {
        taskGrid.innerHTML = '<div class="no-tasks">No tasks match your current filter.</div>'
        updateStats()
        return
    }

    for (var i = 0; i < list.length; i++) {
        taskGrid.appendChild(makeCard(list[i]))
    }

    updateStats()
}

function makeCard(task) {
    var card = document.createElement("div")
    card.className = "task-card"

    var del = document.createElement("button")
    del.className = "delete-btn"
    del.innerHTML = '<span class="material-symbols-sharp">delete</span>'
    del.addEventListener("click", function() {
        tasks = tasks.filter(function(t) {
            return t.id != task.id
        })
        renderTasks()
    })

    var name = document.createElement("p")
    name.className = task.status == "done" ? "task-name task-name--done" : "task-name"
    name.textContent = task.name

    var desc = document.createElement("p")
    desc.className = "task-desc"
    desc.textContent = task.desc

    var pBadge = document.createElement("span")
    pBadge.className = "badge priority-badge priority-badge--" + task.priority
    pBadge.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1)

    var sBadge = document.createElement("span")
    sBadge.className = "badge status-badge status-badge--" + task.status
    sBadge.textContent = statusLabel(task.status)

    var badges = document.createElement("div")
    badges.className = "task-badges"
    badges.appendChild(pBadge)
    badges.appendChild(sBadge)

    var date = document.createElement("span")
    date.className = "task-date"
    date.textContent = longDate(task.date)

    var btn = document.createElement("button")
    btn.className = task.status == "done" ? "btn-status btn-status--undo" : "btn-status btn-status--action"

    if (task.status == "done") {
        btn.textContent = "Undo"
        btn.addEventListener("click", function() { setStatus(task.id, "todo") })
    } else if (task.status == "todo") {
        btn.textContent = "Mark In Progress"
        btn.addEventListener("click", function() { setStatus(task.id, "in-progress") })
    } else {
        btn.textContent = "Mark Completed"
        btn.addEventListener("click", function() { setStatus(task.id, "done") })
    }

    var footer = document.createElement("div")
    footer.className = "task-footer"
    footer.appendChild(date)
    footer.appendChild(btn)

    card.appendChild(del)
    card.appendChild(name)
    card.appendChild(desc)
    card.appendChild(badges)
    card.appendChild(footer)

    return card
}

function setStatus(id, newStatus) {
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id == id) tasks[i].status = newStatus
    }
    renderTasks()
}

var allTabs = document.querySelectorAll(".tab")

function highlightTab(tab) {
    for (var i = 0; i < allTabs.length; i++) {
        allTabs[i].classList.remove("tab--active")
        allTabs[i].classList.add("tab--inactive")
    }
    tab.classList.add("tab--active")
    tab.classList.remove("tab--inactive")
}

for (var i = 0; i < allTabs.length; i++) {
    allTabs[i].addEventListener("click", function() {
        highlightTab(this)
        filter = this.getAttribute("data-filter")
        renderTasks()
    })
}
highlightTab(allTabs[0])

document.getElementById("searchInput").addEventListener("input", function() {
    search = this.value
    renderTasks()
})

var sortBtn = document.getElementById("sortBtn")
var sortMenu = document.getElementById("sortDropdown")

sortBtn.addEventListener("click", function(e) {
    e.stopPropagation()
    sortMenu.classList.toggle("hidden")
})

document.querySelectorAll(".sort-option").forEach(function(el) {
    el.addEventListener("click", function() {
        sort = this.getAttribute("data-sort")
        sortMenu.classList.add("hidden")
        renderTasks()
    })
})

document.addEventListener("click", function(e) {
    if (!sortBtn.contains(e.target)) sortMenu.classList.add("hidden")
})

var modal = document.getElementById("modalOverlay")
var form = document.getElementById("taskForm")

function openModal() {
    modal.classList.remove("hidden")
    document.getElementById("taskName").focus()
}

function closeModal() {
    modal.classList.add("hidden")
    form.reset()
}

document.getElementById("openModalBtn").addEventListener("click", openModal)
document.getElementById("closeModalBtn").addEventListener("click", closeModal)
document.getElementById("cancelModalBtn").addEventListener("click", closeModal)
modal.addEventListener("click", function(e) { if (e.target == modal) closeModal() })

form.addEventListener("submit", function(e) {
    e.preventDefault()
    var name = document.getElementById("taskName").value.trim()
    if (!name) return

    tasks.unshift({
        id: nextId++,
        name: name,
        desc: document.getElementById("taskDesc").value.trim(),
        priority: document.getElementById("taskPriority").value,
        status: document.getElementById("taskStatus").value,
        date: document.getElementById("taskDate").value
    })

    closeModal()
    renderTasks()
})

var menuBtn = document.getElementById("hamburgerBtn")
var mobileMenu = document.getElementById("mobilePopover")

function closeMenu() {
    mobileMenu.classList.add("hidden")
}

menuBtn.addEventListener("click", function(e) {
    e.stopPropagation()
    mobileMenu.classList.toggle("hidden")
})

document.addEventListener("click", function(e) {
    if (!menuBtn.contains(e.target) && !mobileMenu.contains(e.target)) closeMenu()
})

var navLinks = document.querySelectorAll(".nav-item")

function setActiveNav(page) {
    navLinks.forEach(function(link) {
        link.classList.remove("active")
        if (link.id.indexOf(page) != -1) link.classList.add("active")
    })
}

navLinks.forEach(function(link) {
    link.addEventListener("click", function(e) {
        e.preventDefault()
        setActiveNav(this.id.split("-")[1])
        closeMenu()
    })
})
setActiveNav("dashboard")

var faqs = document.querySelectorAll(".faq-item")

for (var i = 0; i < faqs.length; i++) {
    var question = faqs[i].querySelector(".faq-question")
    var answer = faqs[i].querySelector(".faq-answer")

    question.onclick = (function(ans) {
        return function() {
            for (var j = 0; j < faqs.length; j++) {
                faqs[j].querySelector(".faq-answer").classList.add("hidden")
            }
            if (ans.classList.contains("hidden")) {
                ans.classList.remove("hidden")
            } else {
                ans.classList.add("hidden")
            }
        }
    })(answer)
}

document.addEventListener("keydown", function(e) {
    if (e.key == "Escape") { closeModal(); closeMenu() }
})

renderTasks()
