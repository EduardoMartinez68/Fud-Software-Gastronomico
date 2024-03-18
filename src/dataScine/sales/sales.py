import sys
import ast
import psycopg2

arguments = sys.argv[1:] #this is for get the id of the company

def connection_with_database():
    # connect to the database
    conn = psycopg2.connect(
        host="localhost",
        database="Fud",
        user="postgres",
        password="bobesponja48"
    )
    return conn  

def get_data_sales(cur,company_id):
    query = '''
        SELECT sh.*, dc.*, u.first_name AS employee_first_name, u.second_name AS employee_second_name, 
                u.last_name AS employee_last_name, c.email AS customer_email, b.name_branch
        FROM "Box".sales_history sh
        LEFT JOIN "Kitchen".dishes_and_combos dc ON sh.id_dishes_and_combos = dc.id
        LEFT JOIN "Company".employees e ON sh.id_employees = e.id
        LEFT JOIN "Fud".users u ON e.id_users = u.id
        LEFT JOIN "Company".branches b ON sh.id_branches = b.id
        LEFT JOIN "Company".customers c ON sh.id_customers = c.id
        WHERE sh.id_companies = %s
    '''
    cur.execute(query, (company_id,)) # play the search
    rows = cur.fetchall() # get all the results
    return rows

try:
    conn = connection_with_database()
    cur = conn.cursor() # create a cursor 
    rows = get_data_sales(cur,arguments[0])

    # close the cursor and conexion
    cur.close()
    conn.close()

    #0 id 
    #1 company
    #4 customer 
    #5 price
    #7 cant
    #8 total
    #10 date
    #13 name

    #we will read all the data of the sales
    names=[] #this is for save the name of the combo that was sales 
    for i in rows:
        amount = i[7] #get amount was sale and the add to the list 
        for j in range(int(amount)):
            names.append(i[13])


    combos=list(set(names)) #this is for that not exist data repeat

    #read all the combos and calculate the amount of times that is in the list 
    answer=[]
    for combo in combos:
        amount=names.count(combo)
        answer.append([combo,amount])
    print(answer)

except:
    print([])