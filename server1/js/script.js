
/*
 * ChatGPT assisted with frontend code development.
 */

class PatientApp {
    constructor() {
        this.insertBtn = document.getElementById("insertBtn");
        this.submitBtn = document.getElementById("submitBtn");
        this.sqlQuery = document.getElementById("sqlQuery");
        this.response = document.getElementById("response");

        this.setText();

        this.insertBtn.addEventListener("click", () => this.insertPatients());
        this.submitBtn.addEventListener("click", () => this.getPatients());
    }

    setText() {
        document.title = STRINGS.pageTitle;

        document.getElementById("mainTitle").textContent = STRINGS.mainTitle;
        document.getElementById("insertTitle").textContent = STRINGS.insertTitle;
        document.getElementById("insertDescription").textContent = STRINGS.insertDescription;
        document.getElementById("readTitle").textContent = STRINGS.readTitle;
        document.getElementById("queryLabel").textContent = STRINGS.queryLabel;
        document.getElementById("responseTitle").textContent = STRINGS.responseTitle;

        this.insertBtn.textContent = STRINGS.insertBtn;
        this.submitBtn.textContent = STRINGS.submitBtn;
        this.sqlQuery.value        = STRINGS.defaultQuery;
        this.response.textContent  = STRINGS.ready;
    }

    showResponse(data) {
        this.response.textContent = JSON.stringify(data, null, 2);
    }

    async insertPatients() {
        this.response.textContent = STRINGS.inserting;

        try {
            const response = await fetch(`${API_URL}/insert`, {
                method: "POST"
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || STRINGS.requestFailed);
            }

            this.showResponse(data);

        } catch (error) {
            this.showResponse({
                success: false,
                error: error.message || STRINGS.networkError
            });
        }
    }

    async getPatients() {
        const query = this.sqlQuery.value.trim();

        if (!query) {
            this.response.textContent = STRINGS.emptyQuery;
            return;
        }

        this.response.textContent = STRINGS.loading;

        try {
            const url = `${API_URL}/sql/${encodeURIComponent(query)}`;

            const response = await fetch(url, {
                method: "GET"
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || STRINGS.requestFailed);
            }

            this.showResponse(data);

        } catch (error) {
            this.showResponse({
                success: false,
                error: error.message || STRINGS.networkError
            });
        }
    }
}

const app = new PatientApp();
